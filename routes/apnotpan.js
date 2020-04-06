var express = require('express');
var router = express.Router();
var axios = require('axios');
var session = require('express-session');
var Film = require('../models/film');
var curl = require('curl');

function getJour(etat,now){
    //Recupere la date d'aujourd'hui
    var date = new Date();
    let years = date.getFullYear();
    let month = date.getMonth(); 
    let numjour = date.getDate();
    month = parseInt(month) + 1;
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
    res.render('apnotpan', {
        title: 'Apnotpan',
    });
    
});

// Main route pour l'api renvoie vers les films actu en salle 
router.get('/api/page=?:pages&dateDebut=?:dateDebut&dateFin=?:dateFin&etat=?:etat', async function (req, res, next) {
    var db = req.db;
    if (req.session.email){
        console.log(req.session.email+" is connected");
    }else{
        console.log("no one connected");
    }
    
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
    
    //Variable pour la pagination de la page
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
    curl.get('https://api.themoviedb.org/3/discover/movie?api_key=2b56942ec7b5444caeb3c0a9bdac8f91&language=fr-FR&sort_by=popularity.desc&page=1&primary_release_date.gte=' + dateDebut + '&primary_release_date.lte=' + dateFin, function(err, response, body) {if(response){console.log("On a une reponse")}});
    return res.redirect('/apnotpan/api/page=1&dateDebut=' + dateDebut + '&dateFin=' + dateFin+"&etat=now");
})

// Bouton validation formulaire pour la date
router.post('/api/getdate1', async function (req, res, next) {
    var dateDebut = req.body.date_de_debut;
    var dateFin = req.body.date_de_fin;
    var etat = req.body.etat;
    if (!dateDebut || !dateFin) {
        // appel de la function pour recup la date 
        dateDebut = getJour("debut","now");
        dateFin = getJour("fin","now");
    };
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
                film.save(function (err) { if (err) console.log('Erreur de sauvegarde !') });
            }
            if (result) {
                let collection = db.get('films')
                await collection.find({"idFilm":getIdFilm,"commentaires.commentaire":getComment,"commentaires.pseudo":getPseudo},{"commentaires.commentaire":1},function(err,res){
                    if(!res){
                        let len = res[0].commentaires.length
                        for (let i = 0 ; i<len;i++){
                            if (res[0].commentaires[i].commentaire == getComment){
                                var info = "Le commentaire existe déja";
                                console.log(info)
                                return; 
                            }else{
                                var info = "commentaire ajouté";
                            }
                        }
                    }else{
                        console.log("Il n'existe pas de commentaire pour ce user");
                    }
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
                        },function(err,result){
                            if(err){console.log(err)}else{result}
                        }
                        );
                });              
            }
            // CEST PAS FINI ENCORE XD MAIS C UN BON DEBUT NAN ? 
        }
    });
    res.redirect('/apnotpan/api/getdate')
})

router.get('/api/filmaVenir', async function (req, res, next) {
    var dateDebut = req.body.date_de_debut;
    var dateFin = req.body.date_de_fin;
    
    if (!dateDebut || !dateFin) {
        // appel de la function pour recup la date 
        dateDebut = getJour("debut","venir");
        dateFin = getJour("fin","venir");
    };
    return res.redirect('/apnotpan/api/page=1&dateDebut=' + dateDebut + '&dateFin=' + dateFin+"&etat=venir");
})


module.exports = router;