var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Film = new Schema({
    idFilm: {type: String, unique: true},
    title: String,
    poster_path: String,
    overview: String,
    release_date: String,
    // rajouter une array de genreIds recup de la requete apitmdb !!! 
    commentaires: []
});
module.exports = mongoose.model('Film', Film);
