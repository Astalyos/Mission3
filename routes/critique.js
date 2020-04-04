var express = require('express');
var router = express.Router();
var axios = require('axios');
var session = require('express-session');
var Film = require('../models/film');

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

module.exports = router;