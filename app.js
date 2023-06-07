var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
const auth = require('basic-auth');

var indexRouter = require('./routes/index');

var app = express();

var password = null
const PASS_FILE = './password.txt'
if(fs.existsSync(PASS_FILE)) {
  password = fs.readFileSync(PASS_FILE, 'utf8').toString();
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if(password) {
  app.use(function (req, res, next) {
    let user = auth(req);
    if (user === undefined || user['name'] !== 'test' || user['pass'] !== password) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="ILoveMyCat"');
      res.end('Unauthorized');
    } else {
      next();
    }
  });
}

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
