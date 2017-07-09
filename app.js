var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan')
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const Entities = require('html-entities').XmlEntities
const entities = new Entities()
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const jwtVerify = require('express-jwt')
const secret = 'iloveisolde'
var index = require('./routes/index');
var users = require('./routes/users');
const saltRounds = 8
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123',
  database: 'dev'
})

conn.connect()

// protected api
app.all('/api/*', jwtVerify({secret: secret}), function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token...')
  }
  next()
})

app.post('/login', function(req, res) {
  let userName = req.body.username
  let password = entities.encode(req.body.password)
  // find user
  conn.query('SELECT * FROM user WHERE user_name = ?', [
    userName
  ], function (err, results, fields) {
    if (!err) {
      let user = results[0]
      // validate password
      bcrypt.compare(password, user.password, function (err, result) {
        console.log(user)
        if (result) {
          // Dispatch token for client
          let token = jwt.sign({ user_name: user.user_name }, secret, { expiresIn: 60 * 2 })
          res.json({
            code: '0',
            token: token
          })
        } else {
          res.json({
            code: '1',
            error: '用户不存在'
          })
        }
      })
    } else {
      res.json({
        code: '2',
        error: '用户不存在'
      })
    }
  })
})
app.post('/api/orders', function (req, res) {
  res.json({
    count: 3
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
})

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
