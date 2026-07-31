// ==========================================
// 0. INITIALISATION FIREBASE & SECOURISÉE
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
    console.error("Firebase indisponible:", e);
}

// ==========================================
// 1. DONNÉES ÉVÉNEMENTS
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
// 2. GENERATION DU CALENDRIER
// ==========================================
function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;

    const daysInMonth = 31;
    const startDayOffset = 5; // Samedi 1er Août 2026
    
    let html = '';
    for (let i = 0; i < startDayOffset; i++) {
        html += `<div class="calendar-day empty" style="min-height:40px;"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `2026-08-${day < 10 ? '0' + day : day}`;
        const hasEvent = window.eventsData[dateStr];

        if (hasEvent) {
            html += `
                <div class="calendar-day event-day" style="cursor:pointer; background:#e0f2fe; border:2px solid #0284c7; border-radius:8px; padding:6px; text-align:center; min-height:40px;" onclick="window.location.href='${hasEvent.link}'">
                    <span class="day-number" style="font-weight:bold; color:#0369a1;">${day}</span>
                    <div class="event-icon" style="font-size:16px;">${hasEvent.icon}</div>
                </div>
            `;
        } else {
            html += `
                <div class="calendar-day" style="padding:6px; text-align:center; border:1px solid #e2e8f0; border-radius:6px; min-height:40px;">
                    <span class="day-number">${day}</span>
                </div>
            `;
        }
    }
    calendarGrid.innerHTML = html;
}

// ==========================================
// 3. GESTION POP-UP ET ONGLETS (Connexion/Inscription)
// ==========================================
function setupAuth() {
    const regModal = document.getElementById('register-modal');
    const adminModal = document.getElementById('admin-modal');

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    // Bascule Onglets
    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            formLogin.style.display = 'block';
            formRegister.style.display = 'none';
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            formRegister.style.display = 'block';
            formLogin.style.display = 'none';
        });
    }

    // Ouverture des modales
    document.getElementById('btn-open-register')?.addEventListener('click', () => { if(regModal) regModal.style.display = 'flex'; });
    document.getElementById('btn-open-admin-login')?.addEventListener('click', () => { if(adminModal) adminModal.style.display = 'flex'; });

    // Fermeture des modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if(regModal) regModal.style.display = 'none';
            if(adminModal) adminModal.style.display = 'none';
        });
    });

    // Inscription
    document.getElementById('btn-submit-register')?.addEventListener('click', (e) => {
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
                    alert("Ce pseudo existe déjà !");
                } else {
                    db.ref('users/' + userKey).set(userData).then(() => {
                        localStorage.setItem('user_session', JSON.stringify({ username, avatar, isAdmin: false }));
                        alert("Compte créé avec succès !");
                        location.reload();
                    });
                }
            });
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
                    localStorage.setItem('user_session', JSON.stringify({ username: userData.username, avatar: userData.avatar, isAdmin: false }));
                    location.reload();
                } else {
                    alert("Pseudo ou mot de passe incorrect.");
                }
            });
        }
    });

    // Connexion Admin
    document.getElementById('btn-submit-admin')?.addEventListener('click', (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-pass')?.value.trim();
        if (pass === 'admin123') {
            localStorage.setItem('user_session', JSON.stringify({ username: "Admin", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin", isAdmin: true }));
            location.reload();
        } else {
            alert("Mot de passe admin incorrect.");
        }
    });
}

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user_session'));
    const authStatus = document.getElementById('auth-status');
    const authActions = document.getElementById('auth-actions');

    if (user && authStatus && authActions) {
        authStatus.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${user.avatar}" style="width:36px; height:36px; border-radius:50%; border:2px solid #38bdf8;">
                <span>Bienvenue, <strong>${user.username}</strong> ${user.isAdmin ? '(Admin 🛠️)' : ''}</span>
            </div>
        `;
        authActions.innerHTML = `<button id="btn-logout" class="btn-auth" style="background:#64748b;">Déconnexion</button>`;
        document.getElementById('btn-logout')?.addEventListener('click', () => {
            localStorage.removeItem('user_session');
            location.reload();
        });
    }
}

// ==========================================
// INITIALISATION AU CHARGEMENT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    setupAuth();
    updateAuthUI();
});
