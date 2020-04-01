var express = require('express');
var router = express.Router();
var axios = require('axios');
var session = require('express-session');

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

router.get('/api/page=?:pages&dateDebut=?:dateDebut&dateFin=?:dateFin', async function (req, res, next) {
    var isConnected ="";
    console.log(req.session.user);
    if(!req.session.user){
        isConnected = "Not connected"
    }else{
        isConnected = "Connected : "+req.session.name+" id: "+ req.session.user;
    }
    // var getUserInfo = req.body.userInfo;
    // var getConnected = req.body.connected;
    // console.log(getUserInfo, getConnected);
    var getpage = parseInt(req.params.pages) || 1;

    //Recupere la date d'aujourd'hui
    var date = new Date();
    let years = date.getFullYear();
    let month = date.getMonth();
    let numjour = date.getDate();
    
    //Permet de rajouter 1 au moins car recu avec -1 de base 
    month = parseInt(month)+1;
    let monthf = month+1;
    if (month <10){
        month= "0"+month;
    }
    if (monthf <10){
        monthf= "0"+monthf;
    }
    var dateD = years+"-"+month+"-"+numjour
    var dateF = years+"-"+monthf+"-"+numjour

    var dateDebut = (req.params.dateDebut) || dateD;
    var dateFin = (req.params.dateFin) || dateF;
    var getMovie = await axios.get('https://api.themoviedb.org/3/discover/movie?api_key=2b56942ec7b5444caeb3c0a9bdac8f91&language=fr-FR&sort_by=popularity.desc&page=' + getpage + '&primary_release_date.gte=' + dateDebut + '&primary_release_date.lte=' + dateFin)

    var getTotalPages = parseInt(getMovie.data.total_pages);
    var FilmData = getMovie.data.results;
    var val_moins_3 = parseInt(getpage) - 3;
    var val_plus_3 = parseInt(getpage) + 3;
    var totalpage_plus_3 = getTotalPages + 3;
    var next = parseInt(getpage) + 1;
    var previous = parseInt(getpage) - 1;
    var getGenre = await axios.get('https://api.themoviedb.org/3/genre/movie/list?api_key=67c91e6c478de75dad308e127da768bf&language=fr')
    var toutLesGenres = getGenre.data.genres;

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

    // console.log(val_moins_3, val_plus_3);
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
        isConnected: isConnected,
        genre: toutLesGenres,
    });
});

router.post('/api/getdate', async function (req, res, next) {
    var dateDebut = req.body.date_de_debut;
    var dateFin = req.body.date_de_fin;
    var getpage = req.body.pagenumber;
    if (!dateDebut || !dateFin) {
        dateDebut = "2020-03-01";
        dateFin = "2020-03-31";
    }
    console.log(dateDebut, dateFin, getpage);
    res.redirect('/apnotpan/api/page=' + getpage + '&dateDebut=' + dateDebut + '&dateFin=' + dateFin)
})


router.post('/api/research', async function (req, res, next) {
    var recup = req.body.search;
    console.log(recup);
    res.redirect('research/' + recup);
})

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