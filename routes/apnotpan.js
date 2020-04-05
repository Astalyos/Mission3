var express = require('express');
var router = express.Router();
var axios = require('axios');
var session = require('express-session');
var Film = require('../models/film');

function getJour(etat,now){
    //Recupere la date d'aujourd'hui
    var date = new Date();
    let years = date.getFullYear();
    let month = date.getMonth(); // 00 janvier 11 decembre 
    let numjour = date.getDate();

    month = parseInt(month) + 1; // 01 janvier // 12 decembre
    
    if (now == "venir"){
        
        // Pour avoir les dates de fin des film a venir
        if (etat =="fin"){
            month = parseInt(month) + 1 ;
        }
    }
    if (now =="now"){
        // avoir les film actuellement en salle 
        if (etat == "debut"){
            month = parseInt(month)-1;
        }
    }

    //Si le mois = 0 alors il se transformera en 12 
    if (month == 0){
        years = parseInt(years)-1;
        month = 12;
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

// main route pour l'api renvoie vers les films actu en salle 
router.get('/api/page=?:pages&dateDebut=?:dateDebut&dateFin=?:dateFin&etat=?:etat', async function (req, res, next) {
    // var isConnected = "";
    var db = req.db;
    if (req.session.email){
        console.log(req.session.email+" is connected");
    }else{
        console.log("no one connected");
    }
    // if (!req.session.email) {
    //     isConnected = "Not connected"
    // } else {
    //     isConnected = "Connected : " + req.session.email + " id: " + req.session.uid;
    // }
    // var getUserInfo = req.body.userInfo;
    // var getConnected = req.body.connected;
    
    var getpage = parseInt(req.params.pages) || 1;
    var etat = (req.params.etat)

    // appel de la function pour recup la date 
    var dateDebut = (req.params.dateDebut) || getJour("debut","now");
    var dateFin = (req.params.dateFin) || getJour("fin","now");
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

    //Retour des commentaires de bdd
    var collectFilmUserCommented = await db.get('films').find();
    if (collectFilmUserCommented == []){
        console.log("aucun comm")
    }
    console.log("t "+collectFilmUserCommented);
    //console.log(collectFilmUserCommented[0].commentaires)

    //Comprehension avec console.log

    // {
    // console.log("liste film bdd : ");
    // console.log(collectFilmUserCommented);
    // console.log("================================");
    // console.log('liste film bdd Stringlyfied : ');
    // console.log(JSON.stringify(collectFilmUserCommented));
    // console.log('================================');
    // console.log("test :");
    // console.log(collectFilmUserCommented[0]);
    // console.log('================================');
    // console.log('test stringyfied : ');
    // console.log(JSON.stringify(collectFilmUserCommented[0]));
    // console.log('================================');
    // console.log("test 02 :");
    // console.log(JSON.stringify(collectFilmUserCommented[0][1]))
    // }
    
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
    
    if (etat == "now"){
        var h2 = "Films actuellement en salles :";
        var type ="now"; 
    }
    else if (etat == "venir"){
        var h2 = "Films prochainement en salles :";
        var type = "venir";
    }
    console.log(" dateDebut "+dateDebut+" dateFin "+dateFin)
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
        h2:h2,
        type:type,
        CommentaireBdd: collectFilmUserCommented,
    });
});

// pour la nav bar , permet une redirection sur la date du jour
router.get('/api/getdate', async function (req, res, next) {
    var dateDebut = req.body.date_de_debut;
    var dateFin = req.body.date_de_fin;

    if (!dateDebut || !dateFin) {
        // appel de la function pour recup la date 
        dateDebut = getJour("debut","now");
        dateFin = getJour("fin","now");
    };
    // console.log("route getdate "+dateDebut+" "+dateFin)
    // console.log(dateDebut, dateFin);
    return res.redirect('/apnotpan/api/page=1&dateDebut=' + dateDebut + '&dateFin=' + dateFin+"&etat=now");
})

// Bouton validation formulaire pour la date
router.post('/api/getdate1', async function (req, res, next) {
    var dateDebut = req.body.date_de_debut;
    var dateFin = req.body.date_de_fin;
    var etat = req.body.etat;

    // console.log("Date début : "+ dateDebut +" ,Date Fin : "+dateFin);

    if (!dateDebut || !dateFin) {
        // appel de la function pour recup la date 
        dateDebut = getJour("debut","now");
        dateFin = getJour("fin","now");
    };
    console.log("Getdate1 datedebut "+dateDebut+"  datefin "+ dateFin+"  etat  "+etat)
    // console.log("route getdate1 "+dateDebut+" "+dateFin)
    //console.log(dateDebut, dateFin);
    return res.redirect('/apnotpan/api/page=1&dateDebut=' + dateDebut + '&dateFin=' + dateFin+"&etat="+etat);
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
    var getComm = req.body.commentaireFilm;
    var getPoster = req.body.poster_Path;
    var getRelease_date = req.body.release_date;
    var getGenre = req.body.genreIds;

    // console.log('getComm  '+ getComm + '  getPoster  '+ getPoster)

    var dbRequest = await db.get('films');
    
    await Film.findOne({ "idFilm": getIdFilm },
    async function (err, result) {
      if (err) {
        console.log("pas ok");
      } else {
        if (!result) {
          // Creation d’un film dans la bdd si non existant à l'envoie d'un premier commentaire
          var film = new Film({
            idFilm: getIdFilm,
            title: getTitreFilm,
            poster_path : getPoster, 
            overview : getComm, 
            release_date : getRelease_date,
            genre : getGenre,
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
        //   console.log(film);
        //   console.log("idfilm : "+getIdFilm+" , titreFilm : "+getTitreFilm+" , get Note : "+ getNote + " , + getPseudo : "+getPseudo + " , commentaire : "+ getComment)
        console.log('overview = '+getComm+'  poster_path = '+getPoster)  
        film.save(function (err) { if (err) console.log('Erreur de sauvegarde !') });
        } 
        if (result) {
            let collection = db.get('films')
            // Donc le film existe deja dans la bdd dans ce cas là on push le commentaire à la suite
            collection.update(
                {"idFilm": getIdFilm},
                { $addToSet: 
                    {"commentaires":
                        {
                            "pseudo" : getPseudo,
                            "email": getEmail,
                            "uid": getUid,
                            "note": getNote,
                            "commentaire": getComment
                        }
                    }
                },function(err,res){
                    console.log(err)
                }
             );
            console.log("commentaire ajouté")
            console.log("result : " + result)
            // db.get('film').find({id: getIdFilm})
        }
        // CEST PAS FINI ENCORE XD MAIS C UN BON DEBUT NAN ? 
      }
    });

    res.redirect('/apnotpan/api/getdate')
})

router.get('/api/filmaVenir', async function (req, res, next) {
    var dateDebut = req.body.date_de_debut;
    var dateFin = req.body.date_de_fin;

    console.log("Rentre dans la redirection de filmAVenir")
    
    if (!dateDebut || !dateFin) {
        // appel de la function pour recup la date 
        dateDebut = getJour("debut","venir");
        dateFin = getJour("fin","venir");
    };
    return res.redirect('/apnotpan/api/page=1&dateDebut=' + dateDebut + '&dateFin=' + dateFin+"&etat=venir");
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