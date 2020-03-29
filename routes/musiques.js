var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var ms = require('mediaserver');

/* Liste des musiques */
router.get('/', async function (req, res, next) {
    var db = req.db;
    var collection = db.get('titres');

    var getTotal = await collection.count({});
    var getAllSongs = await collection.find({});
    var objResult = await collection.aggregate({ "$group": { _id: "$genre", count: { $sum: 1 } } });
    var result = "";

    objResult.forEach(function (item, key) {
        result = result + item['_id'] + ":" + item['count'] + " / ";
    });

    console.log(getTotal);

    res.render('musiques', {
        "title": "Liste des musiques",
        "musiqueslist": getAllSongs,
        "getTotal": getTotal,
        "sommes": result
    });
});

// Liste la vue des titres sans mongo
// router.get('/', function (req, res, next) {
//     var tabMusiques = [];
//     fs.readFile(path.join(__dirname, '../api/songs.json'), 'utf8', function (err, songs) {
//         if (err) {
//             throw err;
//         }
//         let resultat = JSON.parse(songs);
//         let liste = resultat.songs;
//         for (var i in liste) {
//             tabMusiques.push(liste[i].titre);
//         }
//         res.render('musiques', { title: 'MusicalBox', tabMusiques: tabMusiques });
//     });
// });

// Joue le morceau
router.get('/player/:titre', function (req, res, next) {
    var title = req.params.titre;
    // var chanson = path.join(__dirname, './public/raw/', req.params.titre);   
    res.render('player', { "titreMusique": title });
});

// Traitement pour la réception du fichier musical en asynchrone Sans mongo
// router.post('/upload', async function (req, res, next) {
//     try {
//         // Si aucun fichier...
//         if (!req.files) {
//             // Retour du message d'erreur, en production cela ne se fait pas...
//             res.send({
//                 status: false,
//                 message: 'No file uploaded'
//             });
//         } else {
//             // Récupérération du fichier avec son "name" HTML
//             let morceau = req.files.upload;
//             // Déplacement du fichier à l'aide de la méthode mv()
//             morceau.mv('./raw/' + morceau.name);
//             // Affichage de la réponse en mode console
//             console.log({
//                 status: true,
//                 message: 'Fichier uploaded',
//                 data: {
//                     name: morceau.name,
//                     mimetype: morceau.mimetype,
//                     size: morceau.size
//                 }
//             });
//             // Redirection vers la liste, donc vers une vue existante
//             res.redirect("/musiques");
//         }
//     } catch (err) {
//         // Là, cela c'est mal passé...
//         res.status(500).send(err);
//     }
// });

// Traitement pour la reception du fichier musical AVEC MONGO
router.post('/upload', async function (req, res, next) {
    try {
        // Si aucun fichier...
        if (!req.files) {
            // Retour du message d'erreur, en production cela ne se fait pas...
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            // Récupérération du fichier avec son "name" HTML
            let morceau = req.files.upload;
            // Déplacement du fichier à l'aide de la méthode mv()
            morceau.mv('./raw/' + morceau.name);
            // Affichage de la réponse en mode console
            console.log({
                status: true,
                message: 'Fichier uploaded',
                data: {
                    name: morceau.name,
                    mimetype: morceau.mimetype,
                    size: morceau.size
                }
            });
            // Ajout effectif et redirection vers la liste
            var db = req.db;
            var tmp = morceau.name;
            nom = tmp.substring(0, tmp.lastIndexOf("."));
            var auteur = req.body.auteur;
            var genre = req.body.genre;
            if (!(auteur) || auteur.trim() == '') {
                auteur = "Unknown";
            }
            if (!(genre) || genre.trim() == '') {
                genre = "Unknown";
            }
            var collection = db.get('titres');
            collection.insert({
                "nom": nom,
                "auteur": auteur,
                "genre": genre
            }, function (err, doc) {
                if (err) {
                    console.log("Insertion non effectuée !");
                } else {
                    console.log("Insertion effectuée !");
                }
                // Redirection vers la liste, donc vers une vue existante
                res.redirect("/musiques");
            });
        }
    } catch (err) {
        // Là, cela c'est mal passé...
        res.status(500).send(err);
    }
});

module.exports = router;
