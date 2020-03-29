var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');


// Retourne tout le fichier JSon
router.get('/songs', function (req, res, next) {
    fs.readFile(path.join(__dirname, 'songs.json'), 'utf8', function (err, songs) {
        if (err) { throw err; }
        liste = JSON.parse(songs);
        res.send(liste);
    });
});

// Retourne les musiques du genre
router.get('/songs/genre/:genre', function (req, res, next) {
    var leGenre = req.params.genre;
    var nb = 0;
    fs.readFile(path.join(__dirname, 'songs.json'), 'utf8', function (err, songs) {
        if (err) {
            throw err;
        }
        var resultat = JSON.parse(songs);
        // Notre fichier contient en fait un objet… contenant d’autres objets
        var liste = resultat.songs;
        for (var i in liste) {
            if (liste[i].genre == leGenre) {
                nb = nb + 1;
            }
        }
        if (nb == 0) {
            res.send('il n\'y a pas de chansons du genre : ' + leGenre);
        } else {
            res.send('il y a ' + nb + ' chanson(s) de ce genre...');
        }
    });
});

//Retourne les musiques par Id
router.get('/songs/:identifiant', function (req, res, next) {
    var songid = req.params.identifiant;
    var validate = false;
    var nb = 0;
    var getgenre="";
    var getauteur="";
    var getname="";
    fs.readFile(path.join(__dirname, 'songs.json'), 'utf8', function (err, songs) {
        if (err) {
            throw err;
        }
        var resultat = JSON.parse(songs);
        // Notre fichier contient en fait un objet… contenant d’autres objets
        var liste = resultat.songs;
        for (var i in liste) {
            if (liste[i].id == songid) {
                validate = true;
                // var getid= liste[i].id;
                getgenre = liste[i].genre;
                getname = liste[i].titre;
                getauteur = liste[i].auteur;
            }
            nb += 1
        }
        console.log(liste)
        if (validate === true) {
            res.send('voici la musique avec l\'id :' + songid 
            + '\n' + 'Le nom est : ' + getname 
            + '\n' + 'L\'auteur est : ' + getauteur 
            + '\n' + 'Cette musique appartient au genre : ' + getgenre);
        } else {
            res.send('il n\'y a pas de chansons avec l\'id : ' + songid);
        }
    });
});


module.exports = router;
