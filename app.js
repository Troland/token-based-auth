const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const md5 = require('md5')
const Entities = require('html-entities').XmlEntities
const entities = new Entities()
const AES = require('crypto-js/aes')
const ENCUTF8 = require('crypto-js/enc-utf8')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const jwtVerify = require('express-jwt')

// AES 加密密钥
const secret = 'iloveisolde'
const index = require('./routes/index')
const users = require('./routes/users')
const saltRounds = 8
const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const conn = mysql.createConnection({
  host: '数据库ip',
  user: '数据库用户名',
  password: '数据库密码',
  database: '数据库'
})

// 连接数据库
conn.connect()

// protected api
app.all('/api/*', jwtVerify({secret: secret}), function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token...')
  }
  next()
})

// username: nick, passpord: 123456
app.post('/login', function(req, res) {
  let userName = req.body.username
  let ciphertext = entities.encode(req.body.password)
  let password = AES.decrypt(ciphertext, 'iloveisolde').toString(ENCUTF8)

  console.log(userName, password)
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

// 注册
app.get('/signup', function(req, res) {
  res.render('signup')
})

// uid
app.post('/signup', function(req, res, next) {
  let username = entities.encode(req.body.username)
  let ciphertext = entities.encode(req.body.password)
  let password = AES.decrypt(ciphertext, 'iloveisolde').toString(ENCUTF8);

  console.log(ciphertext, password)
  let uid = md5(username)
  let user = {
    uid: uid,
    user_name: username,
    password: password
  }
  bcrypt.hash(password, saltRounds).then((hash) => {
    user.password = hash
    conn.query('INSERT INTO user SET ?', user, (error, results, fields) => {
      if (error) {
        res.json({
          code: '1',
          errmessage: err
        })
      } else {
        res.json({
          code: '0',
          result: '创建成功'
        })
      }
    })
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
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
