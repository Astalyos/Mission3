var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Account = new Schema({
    login: String,
    passe: String,
});
module.exports = mongoose.model('Account', Account);
