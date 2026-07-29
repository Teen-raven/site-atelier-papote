// ==========================================
// 1. BASE DE DONNÉES ÉVÉNEMENTS
// ==========================================
const eventsData = {
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
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('registered_users')) || [];
    } catch(e) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem('registered_users', JSON.stringify(users));
}

function getSubmissions() {
    try {
        return JSON.parse(localStorage.getItem('form_submissions')) || [];
    } catch(e) {
        return [];
    }
}

function saveSubmissions(submissions) {
    localStorage.setItem('form_submissions', JSON.stringify(submissions));
}

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

        authActions.innerHTML = `
            ${adminBtn}
            <button id="btn-logout" class="btn-auth" style="background:#64748b; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer;">Déconnexion</button>
        `;

        document.getElementById('btn-logout')?.addEventListener('click', () => {
            localStorage.removeItem('user_session');
            location.reload();
        });

        const nameInput = document.getElementById('name');
        if (nameInput && !user.isAdmin) nameInput.value = user.username;
    }
}

function setupAuth() {
    const regModal = document.getElementById('register-modal');
    const adminModal = document.getElementById('admin-modal');

    // Ouverture des modales
    document.getElementById('btn-open-register')?.addEventListener('click', () => { 
        if(regModal) regModal.style.display = 'flex'; 
    });
    
    document.getElementById('btn-open-admin-login')?.addEventListener('click', () => { 
        if(adminModal) adminModal.style.display = 'flex'; 
    });

    // Fermeture des modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if(regModal) regModal.style.display = 'none';
            if(adminModal) adminModal.style.display = 'none';
        });
    });

    // Gestion des onglets (Connexion vs Inscription)
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

    // Gestion de la prévisualisation de l'avatar
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

    // --- CRÉER UN COMPTE ---
    document.getElementById('btn-submit-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        const username = regUsername?.value.trim();
        const password = document.getElementById('reg-password')?.value.trim();
        const avatar = regAvatar?.value.trim() || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

        if (!username || !password) {
            alert("Veuillez remplir le pseudo ET le mot de passe.");
            return;
        }

        let users = getUsers();
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            alert("Ce pseudo est déjà utilisé. Veuillez en choisir un autre ou vous connecter.");
            return;
        }

        const newUser = { id: Date.now(), username: username, password: password, avatar: avatar, createdAt: new Date().toLocaleDateString('fr-FR') };
        users.push(newUser);
        saveUsers(users);

        const session = { username: newUser.username, avatar: newUser.avatar, isAdmin: false };
        localStorage.setItem('user_session', JSON.stringify(session));

        alert("Inscription réussie !");
        if(regModal) regModal.style.display = 'none';
        updateAuthUI();
    });

    // --- SE CONNECTER ---
    document.getElementById('btn-submit-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();

        if (!username || !password) {
            alert("Veuillez entrer votre pseudo et votre mot de passe.");
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
            alert("Pseudo ou mot de passe incorrect.");
        }
    });

    // --- CONNEXION ADMIN ---
    document.getElementById('btn-submit-admin')?.addEventListener('click', (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-pass')?.value.trim();
        const errorMsg = document.getElementById('admin-error-msg');

        if (pass === 'admin123') {
            const session = { username: "Admin", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin", isAdmin: true };
            localStorage.setItem('user_session', JSON.stringify(session));
            if(adminModal) adminModal.style.display = 'none';
            updateAuthUI();
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
// 4. CARROUSEL
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

// ==========================================
// 6. INITIALISATION UNIQUE (Au chargement de la page)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setupAuth();
    updateAuthUI();
    renderCalendar();
    createDots();

    // Boutons navigation calendrier
    document.getElementById('prev-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Formulaire inscription atelier basique
    const workshopForm = document.getElementById('workshop-form');
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

            const formMessage = document.getElementById('form-message');
            if (formMessage) {
                formMessage.style.color = '#16a34a';
                formMessage.textContent = '✅ Réponses enregistrées !';
            }
            workshopForm.reset();
        });
    }
});
