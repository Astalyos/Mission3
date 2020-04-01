var express = require('express');
var router = express.Router();
var Account = require('../models/account');
var session = require('express-session');


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
  console.log(req.session.user);
  var db = req.db;
  var isConnected = false;
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

  var collection = db.get('accounts');

  if (req.session.user) {
    isConnected = true;
  }
  // var collectUsers = await collection.find({});
  res.render('connection', {
    title: 'Apnotpan',
    users: collection,
    isConnected: isConnected

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
router.post('/login', async function (req, res, next) {
  var db = req.db;
  var login = req.body.login;
  var password = req.body.password;
  var dbRequest = await db.get('accounts').find({ login: login });
  var getlogin = dbRequest[0].login;
  var getId = dbRequest[0]._id;
  var getpassword = dbRequest[0].passe;
  // console.log(dbRequest);
  console.log("user : " + getlogin, "  password : " + getpassword);

  await Account.findOne({ "login": login },
    function (err, result) {
      if (err) {
        console.log("pas ok");
      } else {
        if (result) {
          // Si on à un resultat (donc un utilisateur existant)
          if (password === getpassword) {
            var userInfoJson = {
              userId: login,
            };
            req.session.user = result._id;
            req.session.name = result.login;
            console.log("Connection Réussi !")
            console.log(req.session.user);
            res.redirect('/apnotpan/api/page=1&dateDebut=2020-03-01&dateFin=2020-03-31');
          } else {
            console.log("Mot de passe incorrect...");
            res.redirect('/connection');
          }
        } else {
          console.log("Utilisateur non existant");
          res.redirect('/connection');
        }
      }
    }
  );
});




// try {
//   if (login === getlogin && password === getpassword) {
//     console.log('Connection réussi !');
//     res.redirect('/connection/admin');
//   } else {
//     console.log('Connection échoué :c ');
//     res.redirect('/connection');
//   }
// } catch (err) {
//   // Là, cela c'est mal passé...
//   res.status(500).send(err);
// }


router.post('/register', async function (req, res, next) {
  var db = req.db;
  var registerLogin = req.body.registerLogin;
  var registerPassword = req.body.registerPassword;
  var verifPassword = req.body.confirmRegisterPassword;
  var dbRequest = await db.get('accounts').find({ login: registerLogin });

  if (registerPassword === verifPassword) {
    await Account.findOne({ "login": registerLogin },
      function (err, result) {
        if (err) {
          console.log("pas ok");
        } else {
          if (!result) {
            // Creation d’un utilisateur
            var newUser = new Account({
              login: registerLogin,
              passe: registerPassword,
              role: 'defaultUser'
            });
            // Saving it to the database.
            newUser.save(function (err) { if (err) console.log('Erreur de sauvegarde !') });
            console.log("Félicitation, vous êtes enregistré !");
          }
        }
      }
    );
  } else 
  {
    console.log("mot de passe : " + registerPassword + ", verif : " + verifPassword);
    console.log("Les mots de passe ne correspondent pas, ou l'utilisateur existe déjà, veuillez réessayez.");
    res.redirect('/connection');
  }

  // Finding user in DB
  await Account.findOne({ "login": registerLogin },
    function (err, result) {
      if (err) {
        console.log("pas ok");
      } else {
        if (result) {
          // Si on à un resultat (donc un utilisateur existant) 
          req.session.user = result._id;
          console.log("Connection Réussi !")
          console.log(req.session.user);
          res.redirect('/apnotpan/api/page=1&dateDebut=2020-03-01&dateFin=2020-03-31');
        } else {
          console.log("something went wrong (connection.js ligne 161)")
        }
      }
    }
  );
});



// var dbRequest = await db.get('accounts').find({ login: 'Admin' });
// var getlogin = dbRequest[0].login;
// var getpassword = dbRequest[0].passe;
// console.log(dbRequest);
// console.log("user : " + getlogin, "  password : " + getpassword)
// try {
//   if (login === getlogin && password === getpassword) {
//     console.log('Connection réussi !');
//     res.redirect('/connection/admin');
//   } else {
//     console.log('Connection échoué :c ');
//     res.redirect('/connection');
//   }
// } catch (err) {
//   // Là, cela c'est mal passé...
//   res.status(500).send(err);
// }


router.post('/deconnexion', async function (req, res, next) {
  req.session.destroy();
  res.redirect('/connection');
});


module.exports = router;