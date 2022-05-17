const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Category = db.Category
const Favorite = db.Favorite
const Like = db.Like
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
    const reqParamsId = Number(req.params.id)
    const reqUser = req.user
    return User.findByPk(req.params.id)
      .then(user => {
        Comment.findAll({ raw: true, nest: true, where: { UserId: req.params.id }, include: [{ model: Restaurant, include: [Category] }] })
          .then(comments => {
            const commentedRestaurantNum = comments.length
            comments.forEach(item => {
              if (item.Restaurant.description) {
                item.Restaurant.description = item.Restaurant.description.substring(0, 50)
              }
            })
            return res.render('user/user', { user: user.toJSON(), comments: comments, commentedRestaurantNum: commentedRestaurantNum, reqParamsId: reqParamsId, reqUser: reqUser })
          })
      })
  },

  editUser: (req, res) => {
    return User.findByPk(req.user.id)
      // return User.findByPk(req.params.id) 用 req.params 可以通過測試檔，用 req.user 通過不了
      // 但是用 req.params 會有問題，可以竄改其他帳號的資料
      // 例如用 A 帳號進入到 users/1/edit 頁面
      // 再手動於網址列改成其他user的id users/2/edit 就可進到其他帳號的編輯頁
      // 按下送出後，就可以修改其他帳號的資訊
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
        return User.findByPk(req.user.id)
          // return User.findByPk(req.params.id) 用 req.params 可以通過測試檔，用 req.user 通過不了
          // 但是用 req.params 會有問題，可以竄改其他帳號的資料
          // 例如用 A 帳號進入到 users/1/edit 頁面
          // 再手動於網址列改成其他user的id users/2/edit 就可進到其他帳號的編輯頁
          // 按下送出後，就可以修改其他帳號的資訊
          .then(user => {
            user.update({
              name: req.body.name,
              email: req.body.email,
              image: file ? img.data.link : user.image
            })
              .then((user) => {
                req.flash('success_messages', 'user profile was successfully to update')
                return res.redirect(`/users/${req.user.id}`)
                // return res.redirect(`/users/${req.params.id}`)
              })
          })
      })
    } else {
      return User.findByPk(req.user.id)
        // return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            email: req.body.email,
            image: user.image
          })
            .then((user) => {
              req.flash('success_messages', 'user profile was successfully to update')
              return res.redirect(`/users/${req.user.id}`)
              // return res.redirect(`/users/${req.params.id}`)
            })
        })
    }
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(() => {
      return res.redirect('back')
    }).catch(err => console.log(err))
  },

  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((Like) => {
        Like.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },

  getTopUser: (req, res) => {
    return User.findAll({ include: [{ model: User, as: 'Followers' }] })
      .then(users => {
        users = users.map(user => ({
          ...user.dataValues,
          FollowerCount: user.Followers.length,
          isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
        }))
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
        return res.render('topUser', { users: users })
      })
  }
}

module.exports = userController
