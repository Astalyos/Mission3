var express = require('express');
var router = express.Router();
var Film = require('../models/film');
var axios = require('axios');

/* GET home page. */
router.get('/', async function (req, res, next) {
    var getUid = req.session.uid;
    var data = "";
    var getGenre = await axios.get('https://api.themoviedb.org/3/genre/movie/list?api_key=67c91e6c478de75dad308e127da768bf&language=fr');
    var toutLesGenres = getGenre.data.genres;
    //console.log(getUid)
    await Film.find({"commentaires.uid": "5e87484e83bbde2e2812c6f6"},{"commentaires.commentaire":1,"commentaires.note":1,"title":1,"poster_path":1},
    //5e87484e83bbde2e2812c6f6 mon uid pour test 
    async function (err, result) {
        data = result
        console.log(data)
    })
    res.render('critique', {
        title: 'Apnotpan',
        result: data,
        genre: toutLesGenres,
    });

});

module.exports = router;