// ==========================================
// 1. BASE DE DONNÉES DES ÉVÉNEMENTS (Par date YYYY-MM-DD)
// ==========================================
const eventsData = {
    "2026-08-03": {
        icon: "🎬", // Emoji ou icône affiché dans la case du calendrier
        title: "03 Août - Film, Débat, Repas & Just Dance",
        image: "assets/images/coraline.jpg",
        description: "Matin : Projection du film & débat. Midi : Repas partagé. Après-midi : Session Just Dance !",
        link: "pages/3-aout-film.html"
    }
    // Tu peux ajouter d'autres événements très facilement :
    // , "2026-08-15": { icon: "🎨", title: "Atelier Peinture", image: "assets/images/peinture.jpg", description: "...", link: "..." }
};


// ==========================================
// 2. GESTION DU CARROUSEL / SLIDESHOW
// ==========================================
const slides = [
	{
		image: "coraline.jpg",
		tagLine: "Questionnaire satisfaction <span>en ligne</span>"
	},
	{
		image: "slide2.jpg",
		tagLine: "Impressions tous formats <span>en atelier et en ligne</span>"
	},
	{
		image: "slide3.jpg",
		tagLine: "Grand choix de visuels <span>pour tous vos besoins</span>"
	}
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
		dot.classList.add('dot');
		if (index === currentIndex) {
			dot.classList.add('dot_selected');
		}
		dot.addEventListener('click', () => {
			currentIndex = index;
			updateSlide();
		});
		dotsContainer.appendChild(dot);
	});
}

function updateSlide() {
	if (bannerImg) bannerImg.src = "./assets/images/slideshow/" + slides[currentIndex].image;
	if (bannerTxt) bannerTxt.innerHTML = slides[currentIndex].tagLine;
	
	const dots = document.querySelectorAll('.dot');
	dots.forEach((dot, index) => {
		if (index === currentIndex) {
			dot.classList.add('dot_selected');
		} else {
			dot.classList.remove('dot_selected');
		}
	});
}

function changeSlide(direction) {
	currentIndex += direction;

	if (currentIndex < 0) {
		currentIndex = slides.length - 1;
	} else if (currentIndex >= slides.length) {
		currentIndex = 0;
	}

	updateSlide();
}

createDots();


// ==========================================
// 3. GESTION DU CALENDRIER INTERACTIF
// ==========================================
const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

let currentDate = new Date();
let selectedDateStr = "";

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthYearElement = document.getElementById('calendar-month-year');
    if (monthYearElement) {
        monthYearElement.textContent = monthNames[month] + " " + year;
    }

    const daysContainer = document.getElementById('calendar-days');
    if (!daysContainer) return;

    daysContainer.innerHTML = '';

    // Décalage pour commencer par le Lundi (Lundi = 0, Dimanche = 6)
    let firstDayIndex = new Date(year, month, 1).getDay();
    firstDayIndex = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    const totalDays = new Date(year, month + 1, 0).getDate();

    // Cases vides pour décaler le 1er jour du mois
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty');
        daysContainer.appendChild(emptyDiv);
    }

    const today = new Date();

    // Remplissage des jours
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        const formattedDate = year + "-" + String(month + 1).padStart(2, '0') + "-" + String(day).padStart(2, '0');

        // Récupération des infos d'événement s'il y en a un ce jour-là
        const eventData = eventsData[formattedDate];

        // S'il y a un atelier ce jour-là, on affiche le chiffre + l'icône
        if (eventData && eventData.icon) {
            dayDiv.innerHTML = `<span>${day}</span> <span class="event-icon">${eventData.icon}</span>`;
            dayDiv.classList.add('has-event');
        } else {
            dayDiv.textContent = day;
        }

        // Indiquer la case d'aujourd'hui
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        // Indiquer la case sélectionnée au clic
        if (formattedDate === selectedDateStr) {
            dayDiv.classList.add('selected');
        }

        // Clic sur un jour
        dayDiv.addEventListener('click', () => {
            selectedDateStr = formattedDate;

            // Mettre à jour le champ caché
            const hiddenInput = document.getElementById('selected-date');
            if (hiddenInput) hiddenInput.value = formattedDate;

            // Mettre à jour le texte sous le calendrier
            const displayElement = document.getElementById('selected-date-display');
            if (displayElement) {
                displayElement.innerHTML = 'Date choisie : <span>' + day + ' ' + monthNames[month] + ' ' + year + '</span>';
            }

            // AFFICHER / CACHER L'APERÇU DE L'ÉVÉNEMENT (1er Clic)
            const eventPreview = document.getElementById('event-preview');

            if (eventData && eventPreview) {
                document.getElementById('event-title').textContent = eventData.title;
                document.getElementById('event-image').src = eventData.image;
                document.getElementById('event-description').textContent = eventData.description;
                document.getElementById('event-link').href = eventData.link;
                
                eventPreview.style.display = "block"; // Affiche l'aperçu du film
            } else if (eventPreview) {
                eventPreview.style.display = "none"; // Masque si aucun événement
            }

            // Rafraîchir le calendrier pour colorer la case cliquée
            renderCalendar();
        });

        daysContainer.appendChild(dayDiv);
    }
}

// Écouteurs sur les boutons Mois Précédent / Mois Suivant
document.getElementById('prev-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});


// ==========================================
// 4. ENVOI DU FORMULAIRE DE SATISFACTION
// ==========================================
const workshopForm = document.getElementById('workshop-form');
const formMessage = document.getElementById('form-message');

if (workshopForm) {
    workshopForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name')?.value || "",
            email: document.getElementById('email')?.value || "",
            satisfaction: document.getElementById('satisfaction')?.value || "",
            eventDate: document.getElementById('selected-date')?.value || ""
        };

        try {
            const response = await fetch('http://localhost:3000/api/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                if (formMessage) {
                    formMessage.style.color = 'green';
                    formMessage.textContent = 'Merci ! Vos réponses et votre inscription ont été enregistrées.';
                }
                workshopForm.reset();
            } else {
                if (formMessage) {
                    formMessage.style.color = 'red';
                    formMessage.textContent = 'Erreur lors de l\'envoi. Réessayez plus tard.';
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            if (formMessage) {
                formMessage.style.color = 'red';
                formMessage.textContent = 'Impossible de contacter le serveur.';
            }
        }
    });
}


// ==========================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
});
const response=await fetch('https://site-atelier-papote.onrender.com/api/submit-form',{
	method:'POST'
	headers:{'Content-Type':'application/json'},
	body:JSON.stringify(formData)
});