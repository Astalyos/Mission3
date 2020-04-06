var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');
var stylus = require('stylus');
var fileUpload = require('express-fileupload');
var mongo = require('mongodb');
var monk = require('monk');
var mongoose = require('mongoose');
var db = monk('localhost:27017/apnotpan');
var axios = require('axios');
var curl = require('curl');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apnotpanRouter = require('./routes/apnotpan');
var connectionRouter = require('./routes/connection');
var critiqueRouter = require('./routes/critique');


var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'ElPsyKongroo',
  resave: false,
  saveUninitialized: true,
}));
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/raw', express.static(path.join(__dirname, 'raw')));


// Configuration pour le modèle utilisateur
var Account = require('./models/account');
var Film = require('./models/film');

// Configuration de mongoose
mongoose.connect('mongodb://localhost/apnotpan', { // port de ma mongo 127.0.0.1 : 27017 
  useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true
});
var mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error:'));
mdb.once('open', function () {
  console.log("Connection Mongoose ok !");
});

app.use(function (req, res, next) {
  req.db = db;
  next();
});

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.use(fileUpload({
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'temp')
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/apnotpan', apnotpanRouter);
app.use('/connection', connectionRouter);
app.use('/critique', critiqueRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
