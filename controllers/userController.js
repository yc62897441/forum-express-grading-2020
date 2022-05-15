const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signup: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          if (user) {
            req.flash('error_messages', '信箱重複！')
            return res.redirect('/signup')
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSalt(10).null)
            })
              .then(user => {
                return res.redirect('/signin')
              })
          }
        })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        Comment.findAll({ raw: true, nest: true, where: { UserId: req.params.id }, include: [{ model: Restaurant, include: [Category] }] })
          .then(comments => {
            const commentedRestaurantNum = comments.length
            comments.forEach(item => {
              item.Restaurant.description = item.Restaurant.description.substring(0, 50)
            })
            return res.render('user/user', { user: user.toJSON(), comments: comments, commentedRestaurantNum: commentedRestaurantNum })
          })
      })
  },

  editUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        return res.render('user/edit', { user: user.toJSON() })
      })
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) { console.log('Error: ', err) }
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              email: req.body.email,
              image: file ? img.data.link : user.image
            })
              .then((user) => {
                req.flash('success_messages', 'user profile was successfully to update')
                return res.redirect(`/users/${req.params.id}`)
              })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            email: req.body.email,
            image: user.image
          })
            .then((user) => {
              req.flash('success_messages', 'user profile was successfully to update')
              return res.redirect(`/users/${req.params.id}`)
            })
        })
    }
  }
}

module.exports = userController
