var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Account = new Schema({
    pseudo: String,
    email: {type: String, unique: true},
    passe: String,
    role: String,
});
module.exports = mongoose.model('Account', Account);
