const helpers = require('./_helpers')

const express = require('express')
const exphbs = require('express-handlebars')
// const db = require('./models')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')

const app = express()
const port = process.env.PORT || 3000

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main', helpers: require('./config/handlebars-helpers') }))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
// 把 req.flash 放到 res.locals 裡面
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  // res.locals.user = req.user
  res.locals.user = helpers.getUser(req) // 取代 req.user
  next()
})
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app, passport)
// 上面那一行等於下面這兩行的意思。
// 要注意 require('./routes')(app) 需要放在 app.js 的最後一行，因為按照由上而下的順序，當主程式把 app (也就是 express() ) 傳入路由時，程式中間做的樣板引擎設定、伺服器設定，也要一併透過 app 變數傳進去。
// const router = require('./routes')
// router(app)

module.exports = app
