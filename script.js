// ==========================================
// 0. INITIALISATION FIREBASE (Version Compat/Classique)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDt0pDcCjKaRueh4O7gS9G6gzsKKyUdLnE",
    authDomain: "atelier-papote.firebaseapp.com",
    databaseURL: "https://atelier-papote-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "atelier-papote",
    storageBucket: "atelier-papote.firebasestorage.app",
    messagingSenderId: "1013068157356",
    appId: "1:1013068157356:web:67166cde4ea7a0748e2a09",
    measurementId: "G-PL3ZE3X8TJ"
};

// Initialisation sans module import
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.database() : null;

// ==========================================
// 1. BASE DE DONNÉES ÉVÉNEMENTS
// ==========================================
window.eventsData = window.eventsData || {
    "2026-08-03": {
        icon: "🎬",
        title: "03 Août - Film, Débat, Repas & Just Dance",
        image: "assets/images/coraline.jpg",
        description: "Matin : Projection du film & débat. Midi : Repas partagé. Après-midi : Session Just Dance !",
        link: "./3aout.html"
    }
};

// ==========================================
// 2. GESTION DU STOCKAGE LOCAL (LocalStorage)
// ==========================================
function getSubmissions() {
    try { return JSON.parse(localStorage.getItem('form_submissions')) || []; } catch(e) { return []; }
}
function saveSubmissions(submissions) { localStorage.setItem('form_submissions', JSON.stringify(submissions)); }

// ==========================================
// 3. AUTHENTIFICATION & INTERFACE UTILISATEUR
// ==========================================
function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user_session'));
    const authStatus = document.getElementById('auth-status');
    const authActions = document.getElementById('auth-actions');

    if (user && authStatus && authActions) {
        authStatus.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${user.avatar}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; border:2px solid #0284c7;" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=User'">
                <span>Bienvenue, <strong>${user.username}</strong> ${user.isAdmin ? '(Admin 🛠️)' : ''}</span>
            </div>
        `;

        let adminBtn = user.isAdmin ? `<a href="admin.html" class="btn-auth" style="background-color:#e11d48; color:white; text-decoration:none; padding:8px 12px; border-radius:5px; font-weight:bold; margin-right:5px;">Page Admin ➔</a>` : '';
        let proposalBtn = `<a href="suggestions.html" class="btn-auth" style="background-color:#16a34a; color:white; text-decoration:none; padding:8px 12px; border-radius:5px; font-weight:bold; margin-right:5px;">💡 Mon Profil / Suggestions</a>`;

        authActions.innerHTML = `
            ${adminBtn}
            ${proposalBtn}
            <button id="btn-logout" class="btn-auth" style="background:#64748b; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer;">Déconnexion</button>
        `;

        document.getElementById('btn-logout')?.addEventListener('click', () => {
            localStorage.removeItem('user_session');
            localStorage.removeItem('admin_online');
            location.reload();
        });

        const nameInput = document.getElementById('name');
        if (nameInput && !user.isAdmin) nameInput.value = user.username;
    }
}

function setupAuth() {
    const regModal = document.getElementById('register-modal');
    const adminModal = document.getElementById('admin-modal');

    document.getElementById('btn-open-register')?.addEventListener('click', () => { 
        if(regModal) regModal.style.display = 'flex'; 
    });
    
    document.getElementById('btn-open-admin-login')?.addEventListener('click', () => { 
        if(adminModal) adminModal.style.display = 'flex'; 
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if(regModal) regModal.style.display = 'none';
            if(adminModal) adminModal.style.display = 'none';
        });
    });

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (tabLogin && tabRegister && formLogin && formRegister) {
        tabLogin.addEventListener('click', () => {
            tabLogin.style.borderBottom = "3px solid #0284c7";
            tabRegister.style.borderBottom = "none";
            formLogin.style.display = 'block';
            formRegister.style.display = 'none';
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.style.borderBottom = "3px solid #16a34a";
            tabLogin.style.borderBottom = "none";
            formRegister.style.display = 'block';
            formLogin.style.display = 'none';
        });
    }

    const regUsername = document.getElementById('reg-username');
    const regAvatar = document.getElementById('reg-avatar');
    const avatarPreviewImg = document.getElementById('avatar-preview-img');

    regAvatar?.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (avatarPreviewImg) {
            avatarPreviewImg.src = url || "https://api.dicebear.com/7.x/bottts/svg?seed=" + (regUsername?.value || "Papote");
        }
    });

    regUsername?.addEventListener('input', (e) => {
        if (avatarPreviewImg && !regAvatar?.value.trim()) {
            avatarPreviewImg.src = "https://api.dicebear.com/7.x/bottts/svg?seed=" + (e.target.value || "Papote");
        }
    });

    // 1. INSCRIPTION (FIREBASE)
    document.getElementById('btn-submit-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        const username = regUsername?.value.trim();
        const password = document.getElementById('reg-password')?.value.trim();
        const avatar = regAvatar?.value.trim() || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

        if (!username || !password) {
            alert("Veuillez remplir le pseudo ET le mot de passe.");
            return;
        }

        const userKey = username.toLowerCase();

        db.ref('users/' + userKey).once('value', (snapshot) => {
            if (snapshot.exists()) {
                alert("Ce pseudo est déjà utilisé. Choisissez-en un autre !");
                return;
            }

            const newUser = {
                id: Date.now(),
                username: username,
                password: password,
                avatar: avatar,
                createdAt: new Date().toLocaleDateString('fr-FR')
            };

            db.ref('users/' + userKey).set(newUser).then(() => {
                const session = { username: newUser.username, avatar: newUser.avatar, isAdmin: false };
                localStorage.setItem('user_session', JSON.stringify(session));

                alert("Inscription réussie !");
                if(regModal) regModal.style.display = 'none';
                updateAuthUI();
                location.reload();
            });
        });
    });

    // 2. CONNEXION UTILISATEUR (FIREBASE)
    document.getElementById('btn-submit-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();

        if (!username || !password) {
            alert("Veuillez entrer votre pseudo et votre mot de passe.");
            return;
        }

        const userKey = username.toLowerCase();

        db.ref('users/' + userKey).once('value', (snapshot) => {
            const user = snapshot.val();

            if (user && user.password === password) {
                const session = { username: user.username, avatar: user.avatar, isAdmin: false };
                localStorage.setItem('user_session', JSON.stringify(session));
                
                if(regModal) regModal.style.display = 'none';
                updateAuthUI();
                location.reload();
            } else {
                alert("Pseudo ou mot de passe incorrect.");
            }
        });
    });

    // 3. CONNEXION ADMIN
    document.getElementById('btn-submit-admin')?.addEventListener('click', (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-pass')?.value.trim();
        const errorMsg = document.getElementById('admin-error-msg');

        if (pass === 'admin123') {
            const session = { username: "Admin", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin", isAdmin: true };
            localStorage.setItem('user_session', JSON.stringify(session));
            localStorage.setItem('admin_online', 'true');

            if(adminModal) adminModal.style.display = 'none';
            updateAuthUI();
            location.reload();
        } else {
            if (errorMsg) {
                errorMsg.textContent = "Mot de passe incorrect.";
                errorMsg.style.display = "block";
            } else {
                alert("Mot de passe administrateur incorrect.");
            }
        }
    });
}

// ==========================================
// 4. CARROUSEL D'IMAGES
// ==========================================
const slides = [
    { image: "assets/images/slideshow/coraline.jpg", tagLine: "Questionnaire satisfaction <span>en ligne</span>" },
    { image: "assets/images/slideshow/coraline2.jpg", tagLine: "Ateliers et activités <span>toute l'année</span>" }
];

let currentIndex = 0;

function createDots() {
    const dotsContainer = document.getElementById('dots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.style.width = '12px';
        dot.style.height = '12px';
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = (index === currentIndex) ? '#0284c7' : '#ccc';
        dot.style.cursor = 'pointer';
        
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlide();
        });
        dotsContainer.appendChild(dot);
    });
}

function updateSlide() {
    const bannerImg = document.getElementById('banner-img');
    const bannerTxt = document.getElementById('banner-txt');

    if (bannerImg && slides[currentIndex]) {
        bannerImg.src = slides[currentIndex].image;
        bannerImg.onerror = () => { bannerImg.src = "assets/images/coraline.jpg"; };
    }
    if (bannerTxt && slides[currentIndex]) {
        bannerTxt.innerHTML = slides[currentIndex].tagLine;
    }
    createDots();
}

setInterval(() => {
    if (slides.length > 1) {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlide();
    }
}, 5000);

// ==========================================
// 5. CALENDRIER INTERACTIF
// ==========================================
const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let currentDate = new Date();
let selectedDateStr = "";

function renderCalendar() {
    const daysContainer = document.getElementById('calendar-days');
    if (!daysContainer) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthYearElement = document.getElementById('calendar-month-year');
    if (monthYearElement) monthYearElement.textContent = monthNames[month] + " " + year;

    daysContainer.innerHTML = '';

    let firstDayIndex = new Date(year, month, 1).getDay();
    firstDayIndex = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty');
        daysContainer.appendChild(emptyDiv);
    }

    const today = new Date();

    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        const formattedDate = year + "-" + String(month + 1).padStart(2, '0') + "-" + String(day).padStart(2, '0');
        const eventData = window.eventsData[formattedDate];

        if (eventData && eventData.icon) {
            dayDiv.innerHTML = `<span>${day}</span> <span class="event-icon">${eventData.icon}</span>`;
            dayDiv.classList.add('has-event');
        } else {
            dayDiv.textContent = day;
        }

        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        if (formattedDate === selectedDateStr) {
            dayDiv.classList.add('selected');
        }

        dayDiv.addEventListener('click', () => {
            selectedDateStr = formattedDate;

            const hiddenInput = document.getElementById('selected-date');
            if (hiddenInput) hiddenInput.value = formattedDate;

            const displayElement = document.getElementById('selected-date-display');
            if (displayElement) {
                displayElement.innerHTML = 'Date choisie : <span>' + day + ' ' + monthNames[month] + ' ' + year + '</span>';
            }

            const eventPreview = document.getElementById('event-preview');
            if (eventData && eventPreview) {
                document.getElementById('event-title').textContent = eventData.title;
                document.getElementById('event-image').src = eventData.image;
                document.getElementById('event-description').textContent = eventData.description;
                document.getElementById('event-link').href = eventData.link;
                eventPreview.style.display = "block";
            } else if (eventPreview) {
                eventPreview.style.display = "none";
            }

            renderCalendar();
        });

        daysContainer.appendChild(dayDiv);
    }
}

// ==========================================
// 6. INJECTION DU TCHAT FLOTTANT
// ==========================================
window.addEmoji = function(emoji) {
    const input = document.getElementById('chat-user-input');
    if (input) input.value += emoji;
};

window.sendGifPrompt = function() {
    const input = document.getElementById('chat-user-input');
    const gifUrl = prompt("Collez le lien URL de votre GIF (ex: https://media.giphy.com/...):");
    if (gifUrl && input) {
        input.value = gifUrl;
        const btnSend = document.getElementById('btn-send-chat');
        if (btnSend) btnSend.click();
    }
};

function initFloatingChat() {
    const session = JSON.parse(localStorage.getItem('user_session'));
    const isAdmin = session?.isAdmin || false;

    const chatWidgetHTML = `
        <style>
            #floating-chat-btn { position: fixed; bottom: 20px; right: 20px; background: #0284c7; color: white; border: none; padding: 12px 18px; border-radius: 30px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999; font-size: 15px; }
            #floating-chat-box { position: fixed; bottom: 75px; right: 20px; width: 340px; height: 460px; background: white; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.25); display: none; flex-direction: column; z-index: 9999; border: 1px solid #cbd5e1; overflow: hidden; font-family: Arial, sans-serif; }
            .chat-header { background: #0284c7; color: white; padding: 10px 14px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
            .chat-admin-select { background: #0369a1; color: white; padding: 6px 10px; border-bottom: 1px solid #0284c7; font-size: 12px; display: flex; align-items: center; gap: 5px; }
            .chat-admin-select select { background: white; color: #333; border: none; padding: 3px 6px; border-radius: 4px; font-size: 12px; outline: none; flex: 1; }
            .chat-messages { flex: 1; padding: 10px; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 8px; }
            .msg-bubble { max-width: 80%; padding: 8px 12px; border-radius: 10px; font-size: 13px; line-height: 1.4; word-break: break-word; }
            .msg-bubble img { max-width: 100%; border-radius: 6px; margin-top: 4px; display: block; }
            .msg-user { background: #0284c7; color: white; align-self: flex-end; border-bottom-right-radius: 2px; }
            .msg-admin { background: #e2e8f0; color: #0f172a; align-self: flex-start; border-bottom-left-radius: 2px; }
            .emoji-bar { background: #f1f5f9; padding: 4px 8px; display: flex; gap: 6px; border-top: 1px solid #e2e8f0; }
            .emoji-btn { background: none; border: none; font-size: 16px; cursor: pointer; padding: 2px; }
            .chat-input-area { display: flex; padding: 8px; background: white; border-top: 1px solid #e2e8f0; }
            .chat-input-area input { flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none; }
            .chat-input-area button { background: #16a34a; color: white; border: none; padding: 8px 12px; margin-left: 5px; border-radius: 6px; cursor: pointer; font-weight: bold; }
        </style>

        <button id="floating-chat-btn">💬 Chat Admin</button>
        
        <div id="floating-chat-box">
            <div class="chat-header">
                <div>
                    <div id="chat-header-title">💬 Chat</div>
                </div>
                <span id="close-chat" style="cursor:pointer; font-size:20px;">&times;</span>
            </div>
            
            ${isAdmin ? `
                <div class="chat-admin-select">
                    <span>Discussion avec :</span>
                    <select id="select-chat-user"><option value="">-- Choisir un membre --</option></select>
                </div>
            ` : ''}
            
            <div class="chat-messages" id="chat-messages-container"></div>
            
            <div class="emoji-bar">
                <button class="emoji-btn" onclick="addEmoji('😊')">😊</button>
                <button class="emoji-btn" onclick="addEmoji('😂')">😂</button>
                <button class="emoji-btn" onclick="addEmoji('❤️')">❤️</button>
                <button class="emoji-btn" onclick="addEmoji('👍')">👍</button>
                <button class="emoji-btn" onclick="sendGifPrompt()" style="font-size:11px; font-weight:bold; background:#e2e8f0; border-radius:4px; padding:2px 5px;">🖼️ GIF</button>
            </div>

            <div class="chat-input-area">
                <input type="text" id="chat-user-input" placeholder="Message ou URL d'image/GIF...">
                <button id="btn-send-chat">Envoyer</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatWidgetHTML);

    const btnToggle = document.getElementById('floating-chat-btn');
    const chatBox = document.getElementById('floating-chat-box');
    const btnClose = document.getElementById('close-chat');
    const container = document.getElementById('chat-messages-container');
    const input = document.getElementById('chat-user-input');
    const btnSend = document.getElementById('btn-send-chat');
    const headerTitle = document.getElementById('chat-header-title');
    const selectUser = document.getElementById('select-chat-user');

    let activeChatTarget = isAdmin ? "" : (session?.username || "");

    // Charger les membres enregistrés dans Firebase
    if (isAdmin && selectUser) {
        db.ref('users').on('value', (snapshot) => {
            const data = snapshot.val() || {};
            const usersList = Object.values(data);
            
            selectUser.innerHTML = '<option value="">-- Sélectionner un membre --</option>' + 
                usersList.map(u => `<option value="${u.username}">${u.username}</option>`).join('');
        });

        selectUser.addEventListener('change', (e) => {
            activeChatTarget = e.target.value;
            headerTitle.textContent = activeChatTarget ? `💬 Chat avec ${activeChatTarget}` : "💬 Chat Admin";
            listenToMessages();
        });
    }

    btnToggle.addEventListener('click', () => {
        const currentSession = JSON.parse(localStorage.getItem('user_session'));
        if (!currentSession) {
            alert("⚠️ Vous devez être connecté(e) pour utiliser le tchat !");
            return;
        }
        
        if (!isAdmin) {
            headerTitle.textContent = `💬 Chat avec l'Admin (${currentSession.username})`;
            activeChatTarget = currentSession.username;
            listenToMessages();
        }

        chatBox.style.display = (chatBox.style.display === 'flex') ? 'none' : 'flex';
    });

    btnClose.addEventListener('click', () => { chatBox.style.display = 'none'; });

    function listenToMessages() {
        if (!activeChatTarget) {
            container.innerHTML = `<p style="text-align:center; color:#94a3b8; font-size:12px; margin-top:20px;">Sélectionnez un membre pour voir la conversation.</p>`;
            return;
        }

        db.ref('chat_messages').on('value', (snapshot) => {
            const data = snapshot.val();
            const allMsgs = data ? Object.values(data) : [];

            const chatMsgs = allMsgs.filter(m => m.username && m.username.toLowerCase() === activeChatTarget.toLowerCase());

            container.innerHTML = chatMsgs.map(m => {
                const isImage = m.text.match(/\.(jpeg|jpg|gif|png|webp)$/i) || m.text.includes('giphy.com') || m.text.includes('tenor.com');
                const content = isImage ? `<img src="${m.text}" alt="GIF">` : m.text;
                const isMe = (isAdmin && m.fromAdmin) || (!isAdmin && !m.fromAdmin);

                return `
                    <div class="msg-bubble ${isMe ? 'msg-user' : 'msg-admin'}">
                        <strong style="display:block; font-size:10px; opacity:0.8;">${m.senderName} (${m.timestamp || ''})</strong>
                        ${content}
                    </div>
                `;
            }).join('');
            container.scrollTop = container.scrollHeight;
        });
    }

    btnSend.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    function sendMessage() {
        const currentSession = JSON.parse(localStorage.getItem('user_session'));
        const text = input.value.trim();
        if (!text || !currentSession) return;

        if (isAdmin && !activeChatTarget) {
            alert("Veuillez d'abord choisir un membre dans le menu déroulant.");
            return;
        }

        const newMessage = {
            id: Date.now(),
            username: activeChatTarget,
            senderName: currentSession.username,
            text: text,
            fromAdmin: currentSession.isAdmin,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };

        db.ref('chat_messages').push(newMessage).then(() => {
            input.value = '';
        });
    }
}

// ==========================================
// 7. LOGIQUE SPÉCIFIQUE À L'ATELIER DU 3 AOÛT
// ==========================================
const WORKSHOP_3AOUT_ID = "2026-08-03";

function renderProposals3Aout() {
    const proposalsList = document.getElementById('proposals-list');
    if (!proposalsList) return;

    const proposals = JSON.parse(localStorage.getItem('workshop_proposals')) || [];
    const workshopProposals = proposals.filter(p => p.workshopId === WORKSHOP_3AOUT_ID || p.workshopName?.includes('3 Août'));

    if (workshopProposals.length === 0) {
        proposalsList.innerHTML = "<p style='color:#64748b;'>Aucune proposition pour le moment. Soyez le premier !</p>";
        return;
    }

    proposalsList.innerHTML = workshopProposals.map(p => `
        <div class="proposal-card" style="background:#0f172a; border:1px solid #334155; padding:12px; border-radius:8px; margin-bottom:10px;">
            <div class="proposal-header" style="display:flex; justify-content:space-between; font-size:12px; color:#94a3b8; margin-bottom:6px;">
                <span>👤 ${p.userName}</span>
                <span>🕒 ${p.date || p.submittedAt || ''}</span>
            </div>
            <p style="margin: 5px 0; color:#f8fafc;">${p.message}</p>
            ${p.reply ? `
                <div style="background: rgba(2, 132, 199, 0.15); border-left: 3px solid #0284c7; padding: 8px; margin-top: 8px; border-radius: 4px;">
                    <strong style="color:#38bdf8;">🛠️ Réponse de l'Admin :</strong>
                    <p style="margin:3px 0 0 0; color:#cbd5e1;">${p.reply}</p>
                </div>
            ` : `<small style="color:#f59e0b; font-weight:bold;">⌛ En attente de réponse de l'admin</small>`}
        </div>
    `).join('');
}

function init3AoutPage() {
    const proposalForm = document.getElementById('proposal-form');
    const proposalInput = document.getElementById('proposal-text');

    renderProposals3Aout();

    if (proposalForm && proposalInput) {
        proposalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const session = JSON.parse(localStorage.getItem('user_session'));

            if (!session) {
                alert("⚠️ Vous devez être connecté(e) pour envoyer une proposition !");
                return;
            }

            const text = proposalInput.value.trim();
            if (!text) return;

            const newProposal = {
                id: Date.now(),
                workshopId: WORKSHOP_3AOUT_ID,
                workshopName: "Film & Débat du 3 Août",
                userName: session.username,
                message: text,
                date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            };

            const proposals = JSON.parse(localStorage.getItem('workshop_proposals')) || [];
            proposals.push(newProposal);
            localStorage.setItem('workshop_proposals', JSON.stringify(proposals));

            proposalInput.value = '';
            renderProposals3Aout();
            alert("Votre proposition a été envoyée !");
        });
    }
}

// ==========================================
// 8. INITIALISATION GLOBALE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    setupAuth();
    renderCalendar();
    initFloatingChat();
    init3AoutPage();
});
