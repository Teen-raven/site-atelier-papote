// ==========================================
// 0. CONFIGURATION FIREBASE & INITIALISATION SÉCURISÉE
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

let db = null;

// Initialisation sécurisée de Firebase pour éviter le crash du JS
try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
    } else {
        console.warn("⚠️ Firebase N'EST PAS chargé via les balises script dans le HTML.");
    }
} catch (e) {
    console.error("Erreur d'initialisation Firebase :", e);
}

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
// 2. INITIALISATION CARROUSEL & CALENDRIER
// ==========================================
function initCarousel() {
    const track = document.querySelector('.carousel-track') || document.getElementById('carousel-track');
    const prevBtn = document.querySelector('.carousel-btn.prev') || document.getElementById('prev-btn');
    const nextBtn = document.querySelector('.carousel-btn.next') || document.getElementById('next-btn');

    if (!track) return;

    const cardWidth = 320;

    if (nextBtn) {
        nextBtn.onclick = () => {
            track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        };
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        };
    }
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;

    const daysInMonth = 31;
    const startDayOffset = 5; // Samedi pour le 1er août 2026
    
    let html = '';
    for (let i = 0; i < startDayOffset; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `2026-08-${day < 10 ? '0' + day : day}`;
        const hasEvent = window.eventsData[dateStr];

        if (hasEvent) {
            html += `
                <div class="calendar-day event-day" style="cursor:pointer; background:#e0f2fe; border:2px solid #0284c7; border-radius:8px; padding:5px; text-align:center;" onclick="window.location.href='${hasEvent.link}'">
                    <span class="day-number" style="font-weight:bold;">${day}</span>
                    <div class="event-icon" style="font-size:18px; margin-top:2px;">${hasEvent.icon}</div>
                </div>
            `;
        } else {
            html += `
                <div class="calendar-day" style="padding:5px; text-align:center;">
                    <span class="day-number">${day}</span>
                </div>
            `;
        }
    }
    calendarGrid.innerHTML = html;
}

// ==========================================
// 3. AUTHENTIFICATION & UTILISATEURS
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
            if (user.username && db) {
                db.ref('presence/' + user.username.toLowerCase().replace(/\./g, '_')).remove();
            }
            localStorage.removeItem('user_session');
            location.reload();
        });
    }
}

function setupAuth() {
    const regModal = document.getElementById('register-modal');
    const adminModal = document.getElementById('admin-modal');

    document.getElementById('btn-open-register')?.addEventListener('click', () => { if(regModal) regModal.style.display = 'flex'; });
    document.getElementById('btn-open-admin-login')?.addEventListener('click', () => { if(adminModal) adminModal.style.display = 'flex'; });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if(regModal) regModal.style.display = 'none';
            if(adminModal) adminModal.style.display = 'none';
        });
    });

    // Inscription (Compte en ligne Firebase ou secours Local)
    document.getElementById('btn-submit-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username')?.value.trim();
        const password = document.getElementById('reg-password')?.value.trim();
        const avatar = document.getElementById('reg-avatar')?.value.trim() || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

        if (!username || !password) {
            alert("Veuillez remplir le pseudo et le mot de passe.");
            return;
        }

        const userKey = username.toLowerCase().replace(/\./g, '_');
        const userData = { username, password, avatar, createdAt: new Date().toLocaleDateString('fr-FR') };

        if (db) {
            const userRef = db.ref('users/' + userKey);
            userRef.once('value', snapshot => {
                if (snapshot.exists()) {
                    alert("Ce pseudo est déjà utilisé. Choisissez-en un autre.");
                } else {
                    userRef.set(userData).then(() => {
                        const session = { username: userData.username, avatar: userData.avatar, isAdmin: false };
                        localStorage.setItem('user_session', JSON.stringify(session));
                        db.ref('presence/' + userKey).set(true);
                        alert("Compte créé avec succès !");
                        if(regModal) regModal.style.display = 'none';
                        location.reload();
                    });
                }
            });
        } else {
            // Mode secours au cas où Firebase ne charge pas
            const session = { username: userData.username, avatar: userData.avatar, isAdmin: false };
            localStorage.setItem('user_session', JSON.stringify(session));
            alert("Compte créé en local !");
            location.reload();
        }
    });

    // Connexion Membre
    document.getElementById('btn-submit-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();

        if (!username || !password) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        if (db) {
            const userKey = username.toLowerCase().replace(/\./g, '_');
            db.ref('users/' + userKey).once('value', snapshot => {
                const userData = snapshot.val();
                if (userData && userData.password === password) {
                    const session = { username: userData.username, avatar: userData.avatar, isAdmin: false };
                    localStorage.setItem('user_session', JSON.stringify(session));
                    db.ref('presence/' + userKey).set(true);
                    if(regModal) regModal.style.display = 'none';
                    location.reload();
                } else {
                    alert("Pseudo ou mot de passe incorrect.");
                }
            });
        } else {
            alert("⚠️ La connexion au serveur échoue. Vérifiez votre connexion.");
        }
    });

    // Connexion Admin
    document.getElementById('btn-submit-admin')?.addEventListener('click', (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-pass')?.value.trim();
        if (pass === 'admin123') {
            const session = { username: "Admin", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin", isAdmin: true };
            localStorage.setItem('user_session', JSON.stringify(session));
            if(db) db.ref('presence/Admin').set(true);
            if(adminModal) adminModal.style.display = 'none';
            location.reload();
        } else {
            alert("Mot de passe admin incorrect.");
        }
    });
}

// ==========================================
// 4. CHAT FLOTTANT TEMPS RÉEL
// ==========================================
function initFloatingChat() {
    const chatWidgetHTML = `
        <style>
            #floating-chat-btn { position: fixed; bottom: 20px; right: 20px; background: #0284c7; color: white; border: none; padding: 12px 18px; border-radius: 30px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999; font-size: 15px; }
            #floating-chat-box { position: fixed; bottom: 75px; right: 20px; width: 340px; height: 450px; background: white; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.25); display: none; flex-direction: column; z-index: 9999; border: 1px solid #cbd5e1; overflow: hidden; font-family: Arial, sans-serif; }
            .chat-header { background: #0284c7; color: white; padding: 10px 14px; font-weight: bold; display: flex; flex-direction: column; gap: 4px; }
            .chat-header-top { display: flex; justify-content: space-between; align-items: center; }
            .chat-messages { flex: 1; padding: 10px; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 8px; }
            .msg-bubble { max-width: 80%; padding: 8px 12px; border-radius: 10px; font-size: 13px; line-height: 1.4; word-break: break-word; }
            .msg-bubble img { max-width: 100%; border-radius: 6px; margin-top: 4px; display: block; }
            .msg-user { background: #0284c7; color: white; align-self: flex-end; border-bottom-right-radius: 2px; }
            .msg-admin { background: #e2e8f0; color: #0f172a; align-self: flex-start; border-bottom-left-radius: 2px; }
            .emoji-bar { background: #f1f5f9; padding: 4px 8px; display: flex; gap: 6px; border-top: 1px solid #e2e8f0; }
            .emoji-btn { background: none; border: none; font-size: 16px; cursor: pointer; }
            .chat-input-area { display: flex; padding: 8px; background: white; border-top: 1px solid #e2e8f0; }
            .chat-input-area input { flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none; }
            .chat-input-area button { background: #16a34a; color: white; border: none; padding: 8px 12px; margin-left: 5px; border-radius: 6px; cursor: pointer; font-weight: bold; }
        </style>

        <button id="floating-chat-btn">💬 Chat Admin</button>
        
        <div id="floating-chat-box">
            <div class="chat-header">
                <div class="chat-header-top">
                    <div>💬 Chat Support <span style="font-size:12px; color:#4ade80;">🟢 En ligne</span></div>
                    <span id="close-chat" style="cursor:pointer; font-size:20px;">&times;</span>
                </div>
                <div id="admin-user-selector-container" style="display:none; margin-top: 4px;">
                    <select id="admin-chat-user-select" style="width:100%; padding:4px; border-radius:4px; border:none; font-size:12px; font-weight:bold; background:#f1f5f9; color:#0f172a;">
                        <option value="">-- Chargement des membres... --</option>
                    </select>
                </div>
            </div>
            
            <div class="chat-messages" id="chat-messages-container"></div>
            
            <div class="emoji-bar">
                <button class="emoji-btn" onclick="addEmoji('😊')">😊</button>
                <button class="emoji-btn" onclick="addEmoji('😂')">😂</button>
                <button class="emoji-btn" onclick="addEmoji('❤️')">❤️</button>
                <button class="emoji-btn" onclick="addEmoji('👍')">👍</button>
                <button class="emoji-btn" onclick="addEmoji('🎉')">🎉</button>
            </div>

            <div class="chat-input-area">
                <input type="text" id="chat-user-input" placeholder="Message ou lien GIF/image...">
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
    const userSelectContainer = document.getElementById('admin-user-selector-container');
    const userSelect = document.getElementById('admin-chat-user-select');

    let selectedUserForAdmin = "";

    btnToggle.addEventListener('click', () => {
        const currentSession = JSON.parse(localStorage.getItem('user_session'));
        if (!currentSession) {
            alert("⚠️ Vous devez être connecté(e) pour utiliser le tchat !");
            return;
        }

        chatBox.style.display = (chatBox.style.display === 'flex') ? 'none' : 'flex';
        
        if (chatBox.style.display === 'flex') {
            if (currentSession.isAdmin) {
                userSelectContainer.style.display = 'block';
                loadAdminUserList();
            } else {
                userSelectContainer.style.display = 'none';
                listenToMessages(currentSession.username);
            }
        }
    });

    btnClose.addEventListener('click', () => { chatBox.style.display = 'none'; });

    window.addEmoji = function(emoji) { if (input) input.value += emoji; };

    function loadAdminUserList() {
        if (!db) return;
        db.ref('users').on('value', snapshot => {
            const users = snapshot.val() || {};
            const usernames = Object.values(users).map(u => u.username).filter(u => u !== 'Admin');
            
            if (usernames.length === 0) {
                userSelect.innerHTML = '<option value="">-- Aucun membre inscrit --</option>';
                return;
            }

            userSelect.innerHTML = '<option value="">-- Choisir une discussion --</option>' + 
                usernames.map(u => `<option value="${u}">👤 Chat avec ${u}</option>`).join('');

            if (!selectedUserForAdmin && usernames.length > 0) {
                selectedUserForAdmin = usernames[0];
                userSelect.value = selectedUserForAdmin;
            }
            if (selectedUserForAdmin) listenToMessages(selectedUserForAdmin);
        });
    }

    userSelect.addEventListener('change', (e) => {
        selectedUserForAdmin = e.target.value;
        if (selectedUserForAdmin) listenToMessages(selectedUserForAdmin);
    });

    function listenToMessages(targetUser) {
        if (!db) return;
        db.ref('chats/' + targetUser.toLowerCase().replace(/\./g, '_')).on('value', snapshot => {
            const currentSession = JSON.parse(localStorage.getItem('user_session'));
            const msgs = snapshot.val() || {};
            const msgList = Object.values(msgs);

            if (msgList.length === 0) {
                container.innerHTML = `<p style="text-align:center; color:#94a3b8; font-size:12px; margin-top:20px;">Aucun message avec ${targetUser}.</p>`;
                return;
            }

            container.innerHTML = msgList.map(m => {
                const isImage = m.text.match(/\.(jpeg|jpg|gif|png|webp)$/i) || m.text.includes('giphy.com') || m.text.includes('tenor.com');
                const content = isImage ? `<img src="${m.text}" alt="GIF">` : m.text;
                const isMe = (currentSession.isAdmin && m.fromAdmin) || (!currentSession.isAdmin && !m.fromAdmin);

                return `
                    <div class="msg-bubble ${isMe ? 'msg-user' : 'msg-admin'}">
                        <strong style="display:block; font-size:11px; opacity:0.8;">${m.senderName}</strong>
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
        if (!text || !currentSession || !db) return;

        const target = currentSession.isAdmin ? selectedUserForAdmin : currentSession.username;
        if (!target) {
            alert("⚠️ Sélectionnez d'abord un utilisateur dans le menu déroulant !");
            return;
        }

        const msgData = {
            senderName: currentSession.username,
            text: text,
            fromAdmin: currentSession.isAdmin,
            timestamp: Date.now()
        };

        db.ref('chats/' + target.toLowerCase().replace(/\./g, '_')).push(msgData).then(() => {
            input.value = '';
        });
    }
}

// ==========================================
// 5. INITIALISATION DE LA PAGE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    renderCalendar();
    setupAuth();
    updateAuthUI();
    initFloatingChat();
});

