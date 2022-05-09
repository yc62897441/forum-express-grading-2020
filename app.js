const express = require('express')
const exphbs = require('express-handlebars')
const db = require('./models')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: true }))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app)
// 上面那一行等於下面這兩行的意思。
//要注意 require('./routes')(app) 需要放在 app.js 的最後一行，因為按照由上而下的順序，當主程式把 app (也就是 express() ) 傳入路由時，程式中間做的樣板引擎設定、伺服器設定，也要一併透過 app 變數傳進去。
// const router = require('./routes')
// router(app)


module.exports = app
