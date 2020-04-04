var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('apnotpan', { title: 'Apnotpan' });
});



// Utilisation d'un paramètre variable dans l'URL
router.get('/n/:nom', function (req, res, next) {
  leNom = req.params.nom;
  res.render('index', { title: leNom });
});



module.exports = router;
