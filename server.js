const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = "MDF2025+"; // 👈 CHANGE CE MOT DE PASSE ICI !

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'submissions.json');

// Fonction pour lire les données existantes
function getSubmissions() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || "[]");
}

// 1. RECEVOIR UNE INSCRIPTION (Formulaire public)
app.post('/api/submit-form', (req, res) => {
    const { name, email, satisfaction, eventDate } = req.body;

    const newSubmission = {
        id: Date.now(),
        name,
        email,
        satisfaction,
        eventDate,
        dateSubmitted: new Date().toLocaleString('fr-FR')
    };

    const submissions = getSubmissions();
    submissions.push(newSubmission);

    // Sauvegarde dans le fichier JSON
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));

    console.log('Nouvelle inscription enregistrée :', newSubmission);
    res.status(200).json({ message: 'Inscription réussie !' });
});

// 2. ESPACE ADMIN : RÉCUPÉRER TOUTES LES DONNÉES
app.post('/api/admin/submissions', (req, res) => {
    const { password } = req.body;

    // Vérification du mot de passe
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const submissions = getSubmissions();
    res.status(200).json(submissions);
});

app.listen(PORT, () => {
    console.log(`Serveur prêt sur http://localhost:${PORT}`);
});
