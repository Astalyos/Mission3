var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Film = new Schema({
    idFilm: {type: String, unique: true},
    titre: String,
    commentaires: []
});
module.exports = mongoose.model('Film', Film);