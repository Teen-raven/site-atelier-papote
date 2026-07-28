// ==========================================
// 1. BASE DE DONNÉES ÉVÉNEMENTS
// ==========================================
const eventsData = {
    "2026-08-03": {
        icon: "🎬",
        title: "03 Août - Film, Débat, Repas & Just Dance",
        image: "assets/images/coraline.jpg",
        description: "Matin : Projection du film & débat. Midi : Repas partagé. Après-midi : Session Just Dance !",
        link: "pages/3aout.html"
    }
};

// ==========================================
// 2. GESTION DES MODALES & AUTHENTIFICATION
// ==========================================
const regModal = document.getElementById('register-modal');
const adminModal = document.getElementById('admin-modal');

const btnOpenRegister = document.getElementById('btn-open-register');
const btnOpenAdmin = document.getElementById('btn-open-admin-login');

const btnSubmitRegister = document.getElementById('btn-submit-register');
const btnSubmitAdmin = document.getElementById('btn-submit-admin');

const regUsername = document.getElementById('reg-username');
const regAvatar = document.getElementById('reg-avatar');
const adminPass = document.getElementById('admin-pass');
const avatarPreviewImg = document.getElementById('avatar-preview-img');

// Mettre à jour l'aperçu de l'avatar au changement
regAvatar?.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
        avatarPreviewImg.src = url;
    } else {
        avatarPreviewImg.src = "https://api.dicebear.com/7.x/bottts/svg?seed=" + (regUsername.value || "Papote");
    }
});

regUsername?.addEventListener('input', (e) => {
    if (!regAvatar.value.trim()) {
        avatarPreviewImg.src = "https://api.dicebear.com/7.x/bottts/svg?seed=" + (e.target.value || "Papote");
    }
});

// Ouverture / Fermeture des pop-ups
btnOpenRegister?.addEventListener('click', () => { regModal.style.display = 'flex'; });
btnOpenAdmin?.addEventListener('click', () => { adminModal.style.display = 'flex'; });

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        regModal.style.display = 'none';
        adminModal.style.display = 'none';
    });
});

// Valider Inscription Utilisateur
btnSubmitRegister?.addEventListener('click', () => {
    const pseudo = regUsername.value.trim();
    if (!pseudo) {
        alert("Veuillez entrer un pseudo !");
        return;
    }

    const avatarUrl = regAvatar.value.trim() || "https://api.dicebear.com/7.x/bottts/svg?seed=" + pseudo;
    const session = { username: pseudo, avatar: avatarUrl, isAdmin: false };
    
    localStorage.setItem('user_session', JSON.stringify(session));
    regModal.style.display = 'none';
    updateAuthUI();
});

// Valider Connexion Admin (Mot de passe: admin123)
btnSubmitAdmin?.addEventListener('click', () => {
    const pass = adminPass.value.trim();
    const errorMsg = document.getElementById('admin-error-msg');

    if (pass === 'admin123') { // 🔑 Mot de passe Admin
        const session = { username: "Admin", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin", isAdmin: true };
        localStorage.setItem('user_session', JSON.stringify(session));
        adminModal.style.display = 'none';
        updateAuthUI();
    } else {
        if (errorMsg) {
            errorMsg.textContent = "Mot de passe incorrect.";
            errorMsg.style.display = "block";
        }
    }
});

// Mise à jour de l'affichage utilisateur
function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user_session'));
    const authStatus = document.getElementById('auth-status');
    const authActions = document.getElementById('auth-actions');

    if (user) {
        authStatus.innerHTML = `
            <div class="user-profile">
                <img src="${user.avatar}" alt="Avatar" class="user-avatar" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=User'">
                <span>Bienvenue, <strong>${user.username}</strong> ${user.isAdmin ? '(Admin 🛠️)' : ''}</span>
            </div>
        `;

        let adminBtnHtml = user.isAdmin ? `<a href="admin.html" class="btn-auth btn-admin">Page Admin ➔</a>` : '';

        authActions.innerHTML = `
            ${adminBtnHtml}
            <button id="btn-logout" class="btn-auth" style="background-color: #64748b;">Déconnexion</button>
        `;

        document.getElementById('btn-logout')?.addEventListener('click', () => {
            localStorage.removeItem('user_session');
            location.reload();
        });

        // Pré-remplir le formulaire d'inscription
        const nameInput = document.getElementById('name');
        if (nameInput && !user.isAdmin) nameInput.value = user.username;
    }
}


// ==========================================
// 3. CARROUSEL CORRIGÉ (SÉCURISÉ)
// ==========================================
const slides = [
    { image: "assets/images/slideshow/coraline.jpg", tagLine: "Questionnaire satisfaction <span>en ligne</span>" },
    { image: "assets/images/slideshow/coraline2.jpg", tagLine: "Ateliers et activités <span>toute l'année</span>" }
];

const bannerImg = document.getElementById('banner-img');
const bannerTxt = document.getElementById('banner-txt');
const dotsContainer = document.getElementById('dots');
let currentIndex = 0;

function createDots() {
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
    if (bannerImg && slides[currentIndex]) {
        bannerImg.src = slides[currentIndex].image;
        // Gestion au cas où l'image 2 n'existe pas encore
        bannerImg.onerror = () => { bannerImg.src = "assets/images/coraline.jpg"; };
    }
    if (bannerTxt && slides[currentIndex]) {
        bannerTxt.innerHTML = slides[currentIndex].tagLine;
    }
    createDots();
}

// Changement automatique toutes les 5 secondes
setInterval(() => {
    if (slides.length > 1) {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlide();
    }
}, 5000);


// ==========================================
// 4. CALENDRIER INTERACTIF
// ==========================================
const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let currentDate = new Date();
let selectedDateStr = "";

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthYearElement = document.getElementById('calendar-month-year');
    if (monthYearElement) monthYearElement.textContent = monthNames[month] + " " + year;

    const daysContainer = document.getElementById('calendar-days');
    if (!daysContainer) return;

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
        const eventData = eventsData[formattedDate];

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

document.getElementById('prev-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});
// ==========================================
// 1. GESTION DES DONNÉES (LOCALES)
// ==========================================
function getUsers() {
    return JSON.parse(localStorage.getItem('registered_users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('registered_users', JSON.stringify(users));
}

function getSubmissions() {
    return JSON.parse(localStorage.getItem('form_submissions')) || [];
}

function saveSubmissions(submissions) {
    localStorage.setItem('form_submissions', JSON.stringify(submissions));
}

// ==========================================
// 2. AUTHENTIFICATION & ONGLETS (CONNEXION / INSCRIPTION)
// ==========================================
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

    // Basculer entre les onglets "Connexion" et "Inscription"
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    tabLogin?.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
    });

    tabRegister?.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.style.display = 'block';
        formLogin.style.display = 'none';
    });

    // --- CONNEXION CLASSIQUE ---
    document.getElementById('btn-submit-login')?.addEventListener('click', () => {
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();

        if (!username || !password) {
            alert("Veuillez remplir le pseudo et le mot de passe.");
            return;
        }

        const users = getUsers();
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

        if (foundUser) {
            const session = { username: foundUser.username, avatar: foundUser.avatar, isAdmin: false };
            localStorage.setItem('user_session', JSON.stringify(session));
            if(regModal) regModal.style.display = 'none';
            updateAuthUI();
        } else {
            alert("Pseudo ou mot de passe incorrect !");
        }
    });

    // --- CRÉATION DE COMPTE (INSCRIPTION) ---
    document.getElementById('btn-submit-register')?.addEventListener('click', () => {
        const username = document.getElementById('reg-username')?.value.trim();
        const password = document.getElementById('reg-password')?.value.trim();
        const avatar = document.getElementById('reg-avatar')?.value.trim() || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

        if (!username || !password) {
            alert("Veuillez choisir un pseudo et un mot de passe.");
            return;
        }

        let users = getUsers();
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            alert("Ce pseudo est déjà pris. Veuillez en choisir un autre ou vous connecter.");
            return;
        }

        const newUser = { id: Date.now(), username, password, avatar, createdAt: new Date().toLocaleDateString('fr-FR') };
        users.push(newUser);
        saveUsers(users);

        // Connexion immédiate après inscription
        const session = { username: newUser.username, avatar: newUser.avatar, isAdmin: false };
        localStorage.setItem('user_session', JSON.stringify(session));
        if(regModal) regModal.style.display = 'none';
        updateAuthUI();
    });

    // --- CONNEXION ADMIN ---
    document.getElementById('btn-submit-admin')?.addEventListener('click', () => {
        const pass = document.getElementById('admin-pass')?.value.trim();
        if (pass === 'admin123') {
            const session = { username: "Admin", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin", isAdmin: true };
            localStorage.setItem('user_session', JSON.stringify(session));
            if(adminModal) adminModal.style.display = 'none';
            updateAuthUI();
        } else {
            alert("Mot de passe administrateur incorrect.");
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
                <img src="${user.avatar}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; border: 2px solid #0284c7;">
                <span>Bienvenue, <strong>${user.username}</strong> ${user.isAdmin ? '🛠️' : ''}</span>
            </div>
        `;

        let adminBtn = user.isAdmin ? `<a href="admin.html" class="btn-auth" style="background-color:#e11d48; color:white; text-decoration:none; padding:8px 12px; border-radius:5px; font-weight:bold;">Page Admin ➔</a>` : '';

        authActions.innerHTML = `
            ${adminBtn}
            <button id="btn-logout" style="background:#64748b; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer;">Déconnexion</button>
        `;

        document.getElementById('btn-logout')?.addEventListener('click', () => {
            localStorage.removeItem('user_session');
            location.reload();
        });

        const nameInput = document.getElementById('name');
        if (nameInput && !user.isAdmin) nameInput.value = user.username;
    }
}

// ==========================================
// 3. ENREGISTREMENT DES RÉPONSES
// ==========================================
const workshopForm = document.getElementById('workshop-form');
const formMessage = document.getElementById('form-message');

if (workshopForm) {
    workshopForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userSession = JSON.parse(localStorage.getItem('user_session'));

        const formData = {
            id: Date.now(),
            name: userSession ? userSession.username : (document.getElementById('name')?.value || "Anonyme"),
            satisfaction: document.getElementById('satisfaction')?.value || "Non spécifié",
            eventDate: document.getElementById('selected-date')?.value || "Non précisée",
            submittedAt: new Date().toLocaleString('fr-FR')
        };

        let submissions = getSubmissions();
        submissions.push(formData);
        saveSubmissions(submissions);

        if (formMessage) {
            formMessage.style.color = '#16a34a';
            formMessage.textContent = '✅ Inscription et réponses enregistrées !';
        }
        
        workshopForm.reset();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupAuth();
    updateAuthUI();
});

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setupAuth();
    updateAuthUI();
});

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    updateAuthUI();
    createDots();
});
