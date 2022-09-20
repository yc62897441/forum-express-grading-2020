const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const Like = db.Like
const Favorite = db.Favorite
const Comment = db.Comment
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants: restaurants })
      })
  },

  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        res.render('admin/create', { categories: categories })
      })
  },

  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req // equal to const file = req.file
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) { console.log('Error: ', err) }
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        })
          .then((restaurant) => {
            req.flash('success_messages', 'restaurant was successfully created')
            res.redirect('/admin/restaurants')
          })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      })
        .then((restaurant) => {
          req.flash('success_messages', 'restaurant was successfully created')
          res.redirect('/admin/restaurants')
        })
    }
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true, include: [Category] })
      .then(restaurant => {
        return res.render('admin/restaurant', { restaurant: restaurant })
      })
  },

  editRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return Restaurant.findByPk(req.params.id, { raw: true })
          .then(restaurant => {
            return res.render('admin/create', { restaurant: restaurant, categories: categories })
          })
      })
  },

  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) { console.log('Error: ', err) }
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
            })
              .then((restaurant) => {
                req.flash('success_messages', 'restaurant was successfully to update')
                return res.redirect('/admin/restaurants')
              })
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          })
            .then((restaurant) => {
              req.flash('success_messages', 'restaurant was successfully to update')
              return res.redirect('/admin/restaurants')
            })
        })
    }
  },

  deleteRestaurant: async (req, res) => {
    // 刪除餐廳，以及相關的 favorites、comments、likes
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(() => {
            Favorite.findAll({ where: { RestaurantId: req.params.id } })
              .then(favorites => {
                Promise.all(favorites.map(favorite => {
                  favorite.destroy()
                }))
              })
              .then(() => {
                Comment.findAll({ where: { RestaurantId: req.params.id } })
                  .then(comments => {
                    Promise.all(comments.map(comment => {
                      comment.destroy()
                    }))
                  })
                  .then(() => {
                    Like.findAll({ where: { RestaurantId: req.params.id } })
                      .then(likes => {
                        Promise.all(likes.map(like => {
                          like.destroy()
                        }))
                      })
                      .then(() => {
                        req.flash('success_messages', 'restaurant was successfully deleted')
                        return res.redirect('/admin/restaurants')
                      })
                  })
              })
          })
      })
      .catch(error => {
        console.log(error)
        return res.redirect('/admin/restaurants')
      })
  },

  getUsers: (req, res) => {
    User.findAll({ raw: true })
      .then(users => {
        return res.render('admin/users', { users: users })
      })
  },

  toggleAdmin: (req, res) => {
    User.findByPk(req.params.id)
      .then(user => {
        if (user.email === 'root@example.com') {
          req.flash('error_messages', "Can not change this user's item!")
          return res.redirect('/admin/users')
        }
        if (user.isAdmin) { return user.update({ isAdmin: false }) }
        if (!user.isAdmin) { return user.update({ isAdmin: true }) }
      })
      .then((user) => {
        req.flash('success_messages', 'user was successfully to update')
        return res.redirect('/admin/users')
      })
  },
  // 下面這種寫法會測試不過
  //   toggleAdmin: (req, res) => {
  //   const toggle = req.body.toggle
  //   const id = req.params.id
  //   User.findByPk(req.params.id)
  //     .then(user => {
  //       if (user.email === 'root@example.com') {
  //         req.flash('error_messages', "Can not change this user's item!")
  //         return res.redirect('/admin/users')
  //       }
  //       user.update({
  //         isAdmin: req.body.toggle,
  //       })
  //     })
  //     .then((user) => {
  //       req.flash('success_messages', 'user was successfully to update')
  //       return res.redirect('/admin/users')
  //     })
  // }
}

module.exports = adminController
