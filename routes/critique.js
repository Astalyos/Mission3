var express = require('express');
var router = express.Router();
var Film = require('../models/film');
var axios = require('axios');

/* GET home page. */
router.get('/', async function (req, res, next) {
    var db = req.db;
    var collectFilmUserCommented = await db.get('films').find();
    var getPseudo = req.session.pseudo;
    var getUid = req.session.uid;
    var data = "";
    var getGenre = await axios.get('https://api.themoviedb.org/3/genre/movie/list?api_key=67c91e6c478de75dad308e127da768bf&language=fr');
    var toutLesGenres = getGenre.data.genres;
    await Film.find({"commentaires.pseudo":getPseudo,"commentaires.uid":getUid},{"commentaires.commentaire":1,"commentaires.note":1,"commentaires.pseudo":1,"title":1,"poster_path":1,"overview":1,"release_date":1,"genre":1,"idFilm":1},
    async function (err, result) {
        if(err){
            console.log(err);
        }
        data = result
    })
    console.log(data)

    // console.log(collectFilmUserCommented[0].commentaires)
    res.render('critique', {
        title: 'Apnotpan',
        result: data,
        genre: toutLesGenres,
        CommentaireBdd: collectFilmUserCommented,
    });
});

// creez une route avec redirection pour modifier son commentaire
router.post('/modifComm',async function(req,res,next){
    var db = req.db;
    var lastCom =  req.body.lastComment;
    var newCom = req.body.NewCommentaire;
    var filmid = req.body.filmIdToBdd;
    var etat = req.body.etat;
    var getNote = parseInt(req.body.Note);
    var getUid = req.session.uid;
    var getEmail = req.session.email;
    var getPseudo = req.session.pseudo;
    if (etat == "modify"){
        let collection = db.get('films')
        // requete bdd qui modifie le commentaire de la personne donc mettre sur le pug un input hidden de l'ancien commentaire et du nouveau !!!
        // requete bdd 
        collection.update(
            {
                "idFilm":filmid,
                "commentaires.uid":getUid,
                "commentaires.commentaire":lastCom
            },
            {$set:
                {
                    "commentaires":
                    [{
                        "pseudo" : getPseudo,
                        "email": getEmail,
                        "uid": getUid,
                        "note": getNote,
                        "commentaire":newCom
                    }]
                }
            },
        async function (err,result){
            if(err){
                console.log("Probleme de modification" +err)
            }
            else{
                console.log("Modification réalisée");
            }
        });
        res.redirect("/critique")
    }
    else if(etat == "delete"){
        let collection = db.get('films')
        collection.update({'idFilm':filmid},{$pull: {'commentaires' : {'uid':getUid,'commentaire':lastCom}}},
        async function(err,res){
            if(err){
                console.log("Probleme de suppression : " + err)
            }else{
                console.log("Supprime avec succes")
            }
        });
        res.redirect("/critique")
    }
})
module.exports = router;