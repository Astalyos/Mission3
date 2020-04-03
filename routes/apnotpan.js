var express = require('express');
var router = express.Router();
var axios = require('axios');
var session = require('express-session');
var Film = require('../models/film');

function getJour(etat){
    //Recupere la date d'aujourd'hui
    var date = new Date();
    let years = date.getFullYear();
    let month = date.getMonth(); // 00 janvier 11 decembre 
    let numjour = date.getDate();

    month = parseInt(month) + 1; // 01 janvier // 12 decembre
    
    console.log("Année "+years+"mois "+ month +"Jour "+ numjour)

    // avoir les film actuellement en salle 
    if (etat == "debut"){
        month = parseInt(month)-1;
        if (month == 0){
            years = parseInt(years)-1;
            console.log("année "+years);
            month = 12;
            console.log("mois "+month)
        }
    }
    // rajouter un 0 
    if (month < 10) {
        month = "0" + month;
    }
    // idem 
    if(numjour < 10){
        numjour = "0"+numjour
    }
    date = years + "-" + month + "-" + numjour
    return date
};

/* GET home page. */
router.get('/', function (req, res, next) {
    // var getUserInfo = req.body.userInfo;
    // var getConnected = req.body.connected;
    res.render('apnotpan', {
        title: 'Apnotpan',
        // connected: getConnected,
        // userInfo: getUserInfo,
    });

});

// main route pour l'api
router.get('/api/page=?:pages&dateDebut=?:dateDebut&dateFin=?:dateFin', async function (req, res, next) {
    // var isConnected = "";
    console.log(req.session.email+" is connected");
    // if (!req.session.email) {
    //     isConnected = "Not connected"
    // } else {
    //     isConnected = "Connected : " + req.session.email + " id: " + req.session.uid;
    // }
    // var getUserInfo = req.body.userInfo;
    // var getConnected = req.body.connected;
    var getpage = parseInt(req.params.pages) || 1;

    // appel de la function pour recup la date 
    var dateDebut = (req.params.dateDebut) || getJour("debut");
    var dateFin = (req.params.dateFin) || getJour("fin");
    console.log(dateDebut+"   "+dateFin)

    // Requete vers l'api TMDB
    var getMovie = await axios.get('https://api.themoviedb.org/3/discover/movie?api_key=2b56942ec7b5444caeb3c0a9bdac8f91&language=fr-FR&sort_by=popularity.desc&page=' + getpage + '&primary_release_date.gte=' + dateDebut + '&primary_release_date.lte=' + dateFin)
    var getGenre = await axios.get('https://api.themoviedb.org/3/genre/movie/list?api_key=67c91e6c478de75dad308e127da768bf&language=fr')
    
    //Variables qui stocke les infos de TMDB
    var getTotalPages = parseInt(getMovie.data.total_pages);
    var FilmData = getMovie.data.results;
    var toutLesGenres = getGenre.data.genres;

    var val_moins_3 = parseInt(getpage) - 3;
    var val_plus_3 = parseInt(getpage) + 3;
    var totalpage_plus_3 = getTotalPages + 3;
    var next = parseInt(getpage) + 1;
    var previous = parseInt(getpage) - 1;
    
    
    // Eviter que la navbar de page aille dans les négatifs
    // Cas ou il y à moins de 3 pages en results
    if (val_moins_3 <= 0) {
        val_moins_3 = 1;
        if (getTotalPages < 7) {
            val_plus_3 = getTotalPages;
        }
        val_plus_3 = 7;
    }
    
    // Eviter que la navbar de page aille au dessus de la taille max et descende dans les négatifs
    // Cas ou il y a plus de 3 pages
    if (val_plus_3 > getTotalPages) {
        val_moins_3 = getTotalPages - 6;
        if ((getTotalPages - 6) < 1) {
            val_moins_3 = 1;
        }
        val_plus_3 = getTotalPages;
    }
    
    //Si on se trouve sur la page 1 cela permet d'avoir les 7 pages d'afficher
    if (getpage == 1) {
        val_moins_3 = 1;
        val_plus_3 = getpage + 6;
    }
    
    
    // Bouton next de la navbar page ne doit pas être supérieur au max disponible
    if (next >= getTotalPages) {
        next = getTotalPages;
    }
    
    // Bouton previous de la navbar ne doit pas aller en dessous de 0
    if (previous <= 0) {
        previous = 1;
    }
    res.render('api', {
        title: 'Apnotpan',
        movies: FilmData,
        total_pages: getTotalPages,
        totalpage_plus_3: totalpage_plus_3,
        getpage: getpage,
        next: next,
        previous: previous,
        val_moins_3: val_moins_3,
        val_plus_3: val_plus_3,
        dateDebut: dateDebut,
        dateFin: dateFin,
        genre: toutLesGenres,
    });
});

// pour la nav bar , permet une redirection sur la date du jour
router.get('/api/getdate', async function (req, res, next) {
    var dateDebut = req.body.date_de_debut;
    var dateFin = req.body.date_de_fin;

    console.log("Date début : "+ dateDebut +" ,Date Fin : "+dateFin);

    if (!dateDebut || !dateFin) {
        // appel de la function pour recup la date 
        dateDebut = getJour("debut");
        dateFin = getJour("fin");
    };
    console.log("getdate SA PASSSE DANS LE ROUTER")
    //console.log(dateDebut, dateFin);
    return res.redirect('/apnotpan/api/page=1&dateDebut=' + dateDebut + '&dateFin=' + dateFin);
})

// Bouton validation formulaire pour la date
router.post('/api/getdate1', async function (req, res, next) {
    var dateDebut = req.body.date_de_debut;
    var dateFin = req.body.date_de_fin;

    console.log("Date début : "+ dateDebut +" ,Date Fin : "+dateFin);

    if (!dateDebut || !dateFin) {
        // appel de la function pour recup la date 
        dateDebut = getJour("debut");
        dateFin = getJour("fin");
    };
    //console.log(dateDebut, dateFin);
    return res.redirect('/apnotpan/api/page=1&dateDebut=' + dateDebut + '&dateFin=' + dateFin);
})


// formulaire ajout commentaire
router.post('/api/formulaireCommentaire', async function (req, res, next) {
    var db = req.db;
    var getPseudo = req.session.pseudo;
    var getEmail = req.session.email;
    var getUid = req.session.uid;
    var getNote = parseInt(req.body.Note);
    var getComment = req.body.Commentaire;
    var getIdFilm = ""+req.body.filmIdToBdd; 
    var getTitreFilm = ""+req.body.titreFilm;  

    var dbRequest = await db.get('film');

    await Film.findOne({ "id": getIdFilm },
    function (err, result) {
      if (err) {
        console.log("pas ok");
      } else {
        if (!result) {
          // Creation d’un film dans la bdd si non existant à l'envoie d'un premier commentaire
          var film = new Film({
            idFilm: getIdFilm,
            titre: getTitreFilm,
            commentaires: [
                {
                    pseudo: getPseudo,
                    email: getEmail,
                    uid: getUid,
                    note: getNote,
                    commentaire: getComment
                }
            ]
          });
          // Enregistre dans la BDD.
          console.log("idfilm : "+getIdFilm+" , titreFilm : "+getTitreFilm+" , get Note : "+ getNote + " , + getPseudo : "+getPseudo)
          film.save(function (err) { if (err) console.log('Erreur de sauvegarde !') });
        } else {
            // Donc le film existe deja dans la bdd
            console.log(result)
            // db.get('film').find({id: getIdFilm})
        }
        // CEST PAS FINI ENCORE XD MAIS C UN BON DEBUT NAN ? 
      }
    });
    res.redirect('/users')
    // .find({ email: email });
})

// pas utilisé encore
router.post('/api/research', async function (req, res, next) {
    var recup = req.body.search;
    console.log(recup);
    res.redirect('research/' + recup);
})

// pas utilisé encore
router.get('/api/research/:movie', async function (req, res, next) {
    var movie = req.params.movie;
    // var getMovie = () => {
    //     await axios.get('https://api.themoviedb.org/3/movie/550?api_key=2b56942ec7b5444caeb3c0a9bdac8f91')
    //         .then(response => { this.results = response.data.results });
    //     console.log(response);
    // };
    getMovie();
    
    res.render('movie', {
        movie: movie,
    });
})

module.exports = router;