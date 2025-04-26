var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require(`express-session`);

var dotenv = require('dotenv');
dotenv.config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var usersRouter = require('./routes/users');
var kendaraanRouter = require('./routes/kendaraanRoutes')
var loginRouter = require('./routes/auth/login');
var registerRouter = require('./routes/auth/register');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookie: {
    maxAge: 600000000,
    secure: false,
    httpOnly: true,
    sameSite:'strict'
  },
  store: new session.MemoryStore,
  saveUninitialized: true,
  resave: `true`,
  secret: `secret`
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/API/kendaraan', kendaraanRouter)
app.use('/API/login', loginRouter);
app.use('/API/register', registerRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
