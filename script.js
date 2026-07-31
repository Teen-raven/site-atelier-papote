// ==========================================
// 0. CONFIGURATION & FIREBASE
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
try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.database();
    }
} catch(e) {
    console.error("Erreur Firebase:", e);
}

// ==========================================
// 1. CARROUSEL / BANNIÈRE ET DOTS
// ==========================================
const bannerData = [
    {
        image: "assets/images/coraline.jpg",
        text: "🎬 03 Août : Film Coraline, Débat, Repas & Just Dance !"
    }
];

let currentSlide = 0;

function initBanner() {
    const bannerImg = document.getElementById('banner-img');
    const bannerTxt = document.getElementById('banner-txt');
    const dotsContainer = document.getElementById('dots');

    if (!dotsContainer || bannerData.length === 0) return;

    // Génération des dots
    dotsContainer.innerHTML = '';
    bannerData.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => showSlide(index));
        dotsContainer.appendChild(dot);
    });

    function showSlide(index) {
        currentSlide = index;
        if (bannerImg) bannerImg.src = bannerData[index].image;
        if (bannerTxt) bannerTxt.textContent = bannerData[index].text;

        const allDots = dotsContainer.querySelectorAll('.dot');
        allDots.forEach((d, i) => {
            d.className = `dot ${i === index ? 'active' : ''}`;
        });
    }

    showSlide(0);
}

// ==========================================
// 2. ÉVÉNEMENTS & CALENDRIER
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

function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;

    const daysInMonth = 31;
    const startDayOffset = 5; // Samedi 1er Août 2026
    
    let html = '';
    for (let i = 0; i < startDayOffset; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `2026-08-${day < 10 ? '0' + day : day}`;
        const hasEvent = window.eventsData[dateStr];

        if (hasEvent) {
            html += `
                <div class="calendar-day event-day" onclick="window.location.href='${hasEvent.link}'" title="${hasEvent.title}">
                    <span class="day-number">${day}</span>
                    <div class="event-icon" style="font-size:16px; margin-top:2px;">${hasEvent.icon}</div>
                </div>
            `;
        } else {
            html += `
                <div class="calendar-day">
                    <span class="day-number">${day}</span>
                </div>
            `;
        }
    }
    calendarGrid.innerHTML = html;
}

// ==========================================
// 3. GESTION DES MODALES ET INSCRIPTION
// ==========================================
function setupAuth() {
    const regModal = document.getElementById('register-modal');
    const adminModal = document.getElementById('admin-modal');

    const btnOpenReg = document.getElementById('btn-open-register');
    const btnOpenAdmin = document.getElementById('btn-open-admin-login');

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    // Ouverture
    if (btnOpenReg) {
        btnOpenReg.onclick = () => {
            if (regModal) regModal.style.display = 'flex';
        };
    }

    if (btnOpenAdmin) {
        btnOpenAdmin.onclick = () => {
            if (adminModal) adminModal.style.display = 'flex';
        };
    }

    // Fermeture
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => {
            if (regModal) regModal.style.display = 'none';
            if (adminModal) adminModal.style.display = 'none';
        };
    });

    // Bascule Onglets
    if (tabLogin && tabRegister) {
        tabLogin.onclick = () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            formLogin.style.display = 'block';
            formRegister.style.display = 'none';
        };

        tabRegister.onclick = () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            formRegister.style.display = 'block';
            formLogin.style.display = 'none';
        };
    }

    // Inscription (Bouton "Créer un compte")
    const btnSubmitRegister = document.getElementById('btn-submit-register');
    if (btnSubmitRegister) {
        btnSubmitRegister.onclick = (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username')?.value.trim();
            const password = document.getElementById('reg-password')?.value.trim();
            const avatar = document.getElementById('reg-avatar')?.value.trim() || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

            if (!username || !password) {
                alert("Veuillez remplir le pseudo et le mot de passe.");
                return;
            }

            const userData = { username, password, avatar };
            const userKey = username.toLowerCase().replace(/\./g, '_');

            if (db) {
                db.ref('users/' + userKey).once('value', snapshot => {
                    if (snapshot.exists()) {
                        alert("Ce pseudo est déjà pris !");
                    } else {
                        db.ref('users/' + userKey).set(userData).then(() => {
                            localStorage.setItem('user_session', JSON.stringify({ username, avatar, isAdmin: false }));
                            alert("Compte créé avec succès !");
                            location.reload();
                        });
                    }
                });
            } else {
                localStorage.setItem('user_session', JSON.stringify({ username, avatar, isAdmin: false }));
                alert("Compte créé avec succès !");
                location.reload();
            }
        };
    }

    // Connexion
    const btnSubmitLogin = document.getElementById('btn-submit-login');
    if (btnSubmitLogin) {
        btnSubmitLogin.onclick = (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username')?.value.trim();
            const password = document.getElementById('login-password')?.value.trim();

            if (!username || !password) {
                alert("Veuillez remplir votre pseudo et mot de passe.");
                return;
            }

            if (db) {
                const userKey = username.toLowerCase().replace(/\./g, '_');
                db.ref('users/' + userKey).once('value', snapshot => {
                    const userData = snapshot.val();
                    if (userData && userData.password === password) {
                        localStorage.setItem('user_session', JSON.stringify({ username: userData.username, avatar: userData.avatar, isAdmin: false }));
                        location.reload();
                    } else {
                        alert("Pseudo ou mot de passe incorrect.");
                    }
                });
            }
        };
    }

    // Admin
    const btnSubmitAdmin = document.getElementById('btn-submit-admin');
    if (btnSubmitAdmin) {
        btnSubmitAdmin.onclick = (e) => {
            e.preventDefault();
            const pass = document.getElementById('admin-pass')?.value.trim();
            if (pass === 'admin123') {
                localStorage.setItem('user_session', JSON.stringify({ username: "Admin", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin", isAdmin: true }));
                location.reload();
            } else {
                alert("Mot de passe incorrect.");
            }
        };
    }
}

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user_session'));
    const authStatus = document.getElementById('auth-status');
    const authActions = document.getElementById('auth-actions');

    if (user && authStatus && authActions) {
        authStatus.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${user.avatar}" style="width:36px; height:36px; border-radius:50%; border:2px solid #38bdf8; object-fit:cover;">
                <span>Bienvenue, <strong>${user.username}</strong> ${user.isAdmin ? '(Admin 🛠️)' : ''}</span>
            </div>
        `;
        authActions.innerHTML = `<button id="btn-logout" class="btn-auth" style="background:#64748b;">Déconnexion</button>`;
        document.getElementById('btn-logout').onclick = () => {
            localStorage.removeItem('user_session');
            location.reload();
        };
    }
}

// ==========================================
// LANCEMENT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initBanner();
    renderCalendar();
    setupAuth();
    updateAuthUI();
});
