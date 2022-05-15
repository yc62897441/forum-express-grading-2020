const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    const whereQuery = {}
    let categoryId = ''
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }

    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    // 當 categoryId 為空字串時，不會跑上面的 if 條件句，所以 whereQuery 仍是空物件 {}，因此下面的 where: whereQuery 是沒有比對條件的
    return Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }).then(result => {
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name
      }))
      Category.findAll({ raw: true, nest: true })
        .then(categories => {
          return res.render('restaurants', {
            restaurants: data, categories: categories, categoryId: categoryId,
            page: page, totalPage: totalPage, prev: prev, next: next
          })
        })
    })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Category, { model: Comment, include: [User] }] })
      .then(restaurant => {
        console.log('restaurant + 1')
        return res.render('restaurant', { restaurant: restaurant.toJSON() })
      })
  },

  getFeeds: (req, res) => {
    // 採用 Promise 寫法，可以同時存取 Restaurant 跟 Comment，兩者都完畢後再進入到下一層 then
    Promise.all([
      Restaurant.findAll({
        raw: true, nest: true, limit: 10,
        order: [['createdAt', 'desc']], include: [Category], raw: true, nest: true
      }),
      Comment.findAll({
        raw: true, nest: true, limit: 10,
        order: [['createdAt', 'desc']], include: [User, Restaurant], raw: true, nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        return res.render('feeds', { restaurants: restaurants, comments: comments })
      })
    // 需先存取 Restaurant，完畢後再存取 Comment，完畢後再進入到下一層 then
    // return Restaurant.findAll({
    //   raw: true, nest: true, limit: 10,
    //   order: [['createdAt', 'desc']], include: [Category], raw: true, nest: true
    // })
    //   .then(restaurants => {
    //     Comment.findAll({
    //       raw: true, nest: true, limit: 10,
    //       order: [['createdAt', 'desc']], include: [User, Restaurant], raw: true, nest: true
    //     })
    //       .then(comments => {
    //         return res.render('feeds', { restaurants: restaurants, comments: comments })
    //       })
    //   })
  },

  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Category], raw: true, nest: true })
      .then(restaurant => {
        Comment.findAll({ where: { RestaurantId: restaurant.id }, raw: true, nest: true })
          .then(comments => {
            const commnetsNum = comments.length
            return res.render('dashboard', { restaurant: restaurant, commnetsNum: commnetsNum })
          })
      })
  }
}

module.exports = restController
