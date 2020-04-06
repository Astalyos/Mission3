var express = require('express');
var router = express.Router();
var Account = require('../models/account');

// Affichage de la liste
router.get('/', async function (req, res, next) {
  var db = req.db;
  var getAdminId = "";
  var succes = false;
  await Account.findOne({ "email": "admin@admin.fr" },
    function (err, result) {
      if (err) {
        console.log("pas ok");
      } else {
        if (!result) {
          // Creation d’un utilisateur
          var admin = new Account({
            pseudo: 'Admin',
            email: 'admin@admin.fr',
            passe: 'slam',
            role: 'Administrateur'
          });
          // Saving it to the database.
          admin.save(function (err) { if (err) console.log('Erreur de sauvegarde !') });
        }
        // si result
        getAdminId = result._id;
      }
    }
  );
  var collection = db.get('accounts');
  var collectUsers = await collection.find({});

  if (req.session.uid === ""+getAdminId) {
    succes = true;
  } else {
    succes = false;
  }

  res.render('users', {
    title: 'Apnotpan',
    users: collectUsers,
    connection: succes
  });
});

module.exports = router;