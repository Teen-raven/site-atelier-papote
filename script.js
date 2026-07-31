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
// 2. CARROUSEL D'IMAGES & DOTS
// ==========================================
const slides = [
    { image: "assets/images/coraline.jpg", tagLine: "Questionnaire satisfaction en ligne" },
    { image: "assets/images/slideshow/coraline2.jpg", tagLine: "Ateliers et activités toute l'année" }
];
let currentIndex = 0;

function createDots() {
    const dotsContainer = document.getElementById('dots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.style.width = index === currentIndex ? '24px' : '12px';
        dot.style.height = '12px';
        dot.style.borderRadius = index === currentIndex ? '6px' : '50%';
        dot.style.backgroundColor = (index === currentIndex) ? '#0284c7' : '#cbd5e1';
        dot.style.cursor = 'pointer';
        dot.style.transition = 'all 0.3s';
        
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
// 3. CALENDRIER INTERACTIF
// ==========================================
const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let currentDate = new Date(2026, 7, 1); // Août 2026
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
        emptyDiv.style.border = "none";
        daysContainer.appendChild(emptyDiv);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        const formattedDate = year + "-" + String(month + 1).padStart(2, '0') + "-" + String(day).padStart(2, '0');
        const eventData = window.eventsData[formattedDate];

        dayDiv.style.minHeight = "48px";
        dayDiv.style.display = "flex";
        dayDiv.style.flexDirection = "column";
        dayDiv.style.alignItems = "center";
        dayDiv.style.justifyContent = "center";
        dayDiv.style.borderRadius = "8px";
        dayDiv.style.border = "1px solid #e2e8f0";
        dayDiv.style.background = "#f8fafc";
        dayDiv.style.cursor = "pointer";
        dayDiv.style.fontSize = "14px";

        if (eventData && eventData.icon) {
            dayDiv.innerHTML = `<span>${day}</span> <span style="font-size:14px; margin-top:2px;">${eventData.icon}</span>`;
            dayDiv.style.background = "#e0f2fe";
            dayDiv.style.border = "2px solid #0284c7";
            dayDiv.style.fontWeight = "bold";
            dayDiv.style.color = "#0369a1";
        } else {
            dayDiv.textContent = day;
        }

        if (formattedDate === selectedDateStr) {
            dayDiv.style.border = "2px solid #16a34a";
            dayDiv.style.background = "#dcfce7";
        }

        dayDiv.addEventListener('click', () => {
            selectedDateStr = formattedDate;

            const hiddenInput = document.getElementById('selected-date');
            if (hiddenInput) hiddenInput.value = formattedDate;

            const displayElement = document.getElementById('selected-date-display');
            if (displayElement) {
                displayElement.innerHTML = 'Date choisie : <strong>' + day + ' ' + monthNames[month] + ' ' + year + '</strong>';
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
// 4. AUTHENTIFICATION & SUGGESTIONS PROFIL
// ==========================================
function setupAuth() {
    const regModal = document.getElementById('register-modal');
    const adminModal = document.getElementById('admin-modal');
    const suggModal = document.getElementById('suggestions-modal');

    document.getElementById('btn-open-register')?.addEventListener('click', () => { if (regModal) regModal.style.display = 'flex'; });
    document.getElementById('btn-open-admin-login')?.addEventListener('click', () => { if (adminModal) adminModal.style.display = 'flex'; });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if (regModal) regModal.style.display = 'none';
            if (adminModal) adminModal.style.display = 'none';
            if (suggModal) suggModal.style.display = 'none';
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
            db.ref('users/' + userKey).set(userData).then(() => {
                localStorage.setItem('user_session', JSON.stringify({ username, avatar, isAdmin: false }));
                alert("Compte créé avec succès !");
                location.reload();
            });
        } else {
            localStorage.setItem('user_session', JSON.stringify({ username, avatar, isAdmin: false }));
            location.reload();
        }
    });

    // Connexion
    document.getElementById('btn-submit-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();

        if (db && username) {
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
            alert("Mot de passe incorrect.");
        }
    });

    // Envoi de suggestion depuis le profil
    document.getElementById('btn-submit-suggestion')?.addEventListener('click', () => {
        const text = document.getElementById('profile-suggestion-text')?.value.trim();
        const user = JSON.parse(localStorage.getItem('user_session'));
        if (text && db && user) {
            db.ref('suggestions').push({ username: user.username, text: text, date: new Date().toISOString() }).then(() => {
                alert("Merci pour votre suggestion !");
                if (suggModal) suggModal.style.display = 'none';
            });
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
                <img src="${user.avatar}" style="width:36px; height:36px; border-radius:50%; border:2px solid #38bdf8; object-fit:cover;">
                <span>Bienvenue, <strong>${user.username}</strong> ${user.isAdmin ? '(Admin 🛠️)' : ''}</span>
            </div>
        `;

        let extraButtons = `<button id="btn-open-suggestions" class="btn-auth" style="background:#10b981;">💡 Mon Profil / Suggestions</button>`;
        if (user.isAdmin) {
            extraButtons += ` <a href="./admin.html" class="btn-auth btn-admin">Page Admin ➔</a>`;
        }

        authActions.innerHTML = `${extraButtons} <button id="btn-logout" class="btn-auth" style="background:#64748b;">Déconnexion</button>`;

        document.getElementById('btn-open-suggestions')?.addEventListener('click', () =>
