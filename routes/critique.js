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
    await Film.find({"commentaires.uid": getUid},{"commentaires.commentaire":1,"commentaires.note":1,"title":1,"poster_path":1,"overview":1,"release_date":1,"genre":1},
    async function (err, result) {
        if(err){
            console.log(err);
        }
        data = result
        console.log(data)
    })
    res.render('critique', {
        title: 'Apnotpan',
        result: data,
        genre: toutLesGenres,
    });

});

//route cree pour laissez l'utilisateur supprime son commentaire s'y il le souhaite !!! 
router.get('/CommDetruit',async function(req,res,next) {
    // requete bdd db.films.update({"idFilm":"!514847"},{$pull:{"commentaires":{"uid":"!5e87484e83bbde2e2812c6f6","commentaire":"!commentaire de la personne"}}})

    // + faire la redirection de la page 
})


// creez une route avec redirection pour modifier son commentaire
router.get('/modifComm',async function(req,res,next){
    // requete bdd qui modifie le commentaire de la personne donc mettre sur le pug un input hidden de l'ancien commentaire et du nouveau !!!
    // requete bdd db.films.update({"idFilm":"idDuFilm","commentaires.uid":"!l'uid de l'utilisateur","commentaires.commentaire":"!ancien commentaire"},{$set:{"commentaires.commentaire":"!nouveau commentaire"}})
    // si la celle la ↑ ne marche pas alors prendre celle la ↓
    // requete bdd db.films.update({"idFilm":"idDuFilm","commentaires.uid":"!l'uid de l'utilisateur","commentaires.commentaire":"!ancien commentaire"},{$set:{"commentaires":{"commentaire":"!nouveau commentaire"}})
})
module.exports = router;