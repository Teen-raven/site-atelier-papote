const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware pour autoriser le JSON et les requêtes Front-End
app.use(cors());
app.use(express.json());

// Fichier où seront sauvegardées les réponses (base de données simplifiée)
const DATA_FILE = './responses.json';

// Route API pour recevoir le formulaire
app.post('/api/submit-form', (req, res) => {
    const newSubmission = req.body;
    newSubmission.dateSent = new Date().toISOString();

    // 1. Lire les anciennes données enregistrées
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let responses = [];
        if (!err && data) {
            responses = JSON.parse(data);
        }

        // 2. Ajouter la nouvelle réponse
        responses.push(newSubmission);

        // 3. Enregistrer dans le fichier JSON confidentiel
        fs.writeFile(DATA_FILE, JSON.stringify(responses, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "Erreur d'écriture serveur" });
            }
            console.log("Nouvelle réponse reçue de :", newSubmission.name);
            return res.status(200).json({ message: "Données enregistrées avec succès !" });
        });
    });
});

// Route VIP confidentielle : Seul toi y a accès via ton serveur
app.get('/api/admin/stats', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err || !data) return res.json({ total: 0, stats: {} });

        const responses = JSON.parse(data);
        const total = responses.length;

        // Calcul des pourcentages de satisfaction
        const satisfactionCounts = {};
        responses.forEach(r => {
            satisfactionCounts[r.satisfaction] = (satisfactionCounts[r.satisfaction] || 0) + 1;
        });

        res.json({
            totalReponses: total,
            statistiques: satisfactionCounts,
            donneesBrutes: responses
        });
    });
});

app.listen(PORT, () => {
    console.log(`Serveur Back-End démarré sur http://localhost:${PORT}`);
});
