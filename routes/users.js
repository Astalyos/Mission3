var express = require('express');
var router = express.Router();
var Account = require('../models/account');

router.get('/admin', async function (req, res, next) {
  var db = req.db;
  var collection = db.get('accounts');

  var collectUsers = await collection.find({});
  // var collectUsers = await db.getCollection('accounts').find({});
  var succes = true;
  res.render('admin', {
    users: collectUsers,
    connection: succes
  });
});

// Affichage de la liste
router.get('/', async function (req, res, next) {
  var db = req.db;
  await Account.findOne({ "login": "Admin" },
    function (err, result) {
      if (err) {
        console.log("pas ok");
      } else {
        if (!result) {
          // Creation d’un utilisateur
          var admin = new Account({
            login: 'Admin',
            passe: 'slam',
            role: 'Administrateur'
          });
          // Saving it to the database.
          admin.save(function (err) { if (err) console.log('Erreur de sauvegarde !') });
        }
      }
    });

  var db = req.db;
  var collection = db.get('accounts');

  var collectUsers = await collection.find({});
  res.render('users', {
    title: 'MusicalBox',
    users: collectUsers,
    connection: false
  });
});

// function checkLogin(dbRequest, login, password) {
//   if (login === dbRequest[0].login && password === dbRequest.passe) {
//     return true;
//   } else {
//     return false
//   }
// }

//Requete connection
router.post('/connection', async function (req, res, next) {
  var db = req.db;
  var dbRequest = await db.get('accounts').find({ login: 'Admin' });
  var login = req.body.login;
  var password = req.body.password;
  var getlogin = dbRequest[0].login;
  var getpassword = dbRequest[0].passe;
  console.log(dbRequest);
  console.log("user : " + getlogin, "  password : " + getpassword)
  try {
    if (login === getlogin && password === getpassword) {
      console.log('Connection réussi !');
      res.redirect('/users/admin');
    } else {
      console.log('Connection échoué :c ');
      res.redirect('/users');
    }
  } catch (err) {
    // Là, cela c'est mal passé...
    res.status(500).send(err);
  }
});


module.exports = router;