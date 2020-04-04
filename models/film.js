var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Film = new Schema({
    idFilm: {type: String, unique: true},
    title: String,
    poster_path: String,
    // rajouter une array de genreIds recup de la requete apitmdb !!! 
    // + rajoute partout ou cette requete est appelle le argument que j'ai rajouté 
    commentaires: []
});
module.exports = mongoose.model('Film', Film);
