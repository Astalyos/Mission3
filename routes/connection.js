var express = require('express');
var router = express.Router();
var Account = require('../models/account');
var session = require('express-session');


router.get('/admin', async function (req, res, next) {
  var db = req.db;
  var collection = db.get('accounts');

  var collectUsers = await collection.find({});
  var succes = true;
  res.render('admin', {
    users: collectUsers,
    connection: succes
  });
});

// Affichage de la liste
router.get('/', async function (req, res, next) {
  if (req.session.uid){
    console.log(req.session.uid);
  }
  var db = req.db;
  var isConnected = false;
  await Account.findOne({ "email": "admin@admin.fr" },
    function (err, result) {
      if (err) {
        console.log("pas ok");
      } else {
        if (!result) {
          // Creation d’un utilisateur
          var admin = new Account({
            pseudo: "Admin",
            email: 'admin@admin.fr',
            passe: 'slam',
            role: 'Administrateur'
          });
          // L'enregistre dans la BDD.
          admin.save(function (err) { if (err) console.log('Erreur de sauvegarde !') });
        }
      }
    });
  var collection = db.get('accounts');
  if (req.session.uid) {
    isConnected = true;
  }

  res.render('connection', {
    title: 'Apnotpan',
    users: collection,
    isConnected: isConnected

  });
});


// Login
router.post('/login', async function (req, res, next) {
  var db = req.db;
  var email = req.body.email;
  var password = req.body.password;
  var dbRequest = await db.get('accounts').find({ email: email });
  // var getPseudo = dbRequest[0].pseudo;  !!!
  // var getemail = dbRequest[0].email; !!!
  // var getId = dbRequest[0]._id;    !!!
  var getpassword = dbRequest[0].passe;

  await Account.findOne({ "email": email },
    function (err, result) {
      if (err) {
        console.log("pas ok");
      } else {
        if (result) {
          // Si on à un resultat (donc un utilisateur existant)
          if (password == getpassword) {
            req.session.uid = result._id;
            req.session.email = result.email;
            req.session.pseudo = result.pseudo;

            res.redirect('/apnotpan/api/getdate');
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

// Register
router.post('/register', async function (req, res, next) {
  var db = req.db;
  var registerEmail = req.body.registerEmail;
  var registerPassword = req.body.registerPassword;
  var registerPseudo = req.body.registerPseudo;
  var verifPassword = req.body.confirmRegisterPassword;
  // var dbRequest = await db.get('accounts').find({ email: registerEmail });  !!!

  if (registerPassword === verifPassword) {
    await Account.findOne({ "email": registerEmail },
      function (err, result) {
        if (err) {
          console.log("pas ok");
        } else {
          if (!result) {
            // Creation d’un utilisateur
            var newUser = new Account({
              pseudo: registerPseudo,
              email: registerEmail,
              passe: registerPassword,
              role: 'defaultUser'
            });

            // Saving it to the database.
            newUser.save(function (err) { if (err) console.log('Erreur de sauvegarde !'+err) });
            console.log("Félicitation, vous êtes enregistré !");
          } else  {
            console.log("Cet utilisateur existe deja / email deja existant ");
          }
        }
      }
    );
  } else 
  {
    console.log("Les mots de passe ne correspondent pas, ou l'utilisateur existe déjà, veuillez réessayez.");
    res.redirect('/connection');
  }

  // Finding user in DB
  await Account.findOne({ "email": registerEmail },
    function (err, result) {
      if (err) {
        console.log("pas ok");
      } else {
        if (result) {
          // Si on à un resultat (donc un utilisateur existant) 
          req.session.pseudo = result.pseudo;
          req.session.email = result.email;
          req.session.uid = result._id;
          console.log("Connection Réussi !")
          res.redirect('/apnotpan/api/page=1&dateDebut=2020-03-01&dateFin=2020-03-31'); // !!! CHANGE MOI SA AVEC LUNE DES ROUTES QUI REDIRECT COGNIO
        } else {
          console.log("something went wrong (connection.js ligne 180)")
        }
      }
    }
  );
});

// deconnexion
router.get('/deconnexion', async function (req, res, next) {
  console.log(req.session.uid); 
  req.session.destroy();
  return res.redirect('/connection');
});

module.exports = router;