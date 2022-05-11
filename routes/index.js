const helpers = require('../_helpers')

const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    // 開發時的寫法註解起來
    // if (req.isAuthenticated()) {
    // 改用下方測試用的 _helper.js
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    return res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    // 開發時的寫法註解起來
    // if (req.isAuthenticated()) {
    //   if (req.user.isAdmin) {
    // 改用下方測試用的 _helper.js
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).isAdmin) {
        return next()
      }
      return redirect('/')
    }
    return res.redirect('/signin')
  }

  app.get('/', authenticated, (req, res) => { res.redirect('/restaurants') })
  app.get('/restaurants', authenticated, restController.getRestaurants)

  app.get('/admin', authenticatedAdmin, (req, res) => { res.redirect('/admin/restaurants') })
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signup)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }), userController.signIn)

  app.get('/logout', userController.logout)
}
