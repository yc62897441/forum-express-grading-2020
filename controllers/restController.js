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
        categoryName: r.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        // FavoritedRestaurants 是一個 array，裡面有 n 個被收藏的餐廳的 object {}
        // 餐廳 object {}，包含餐廳的 id, name, tel...等資訊
        // map(d => d.id) 就是把每筆餐廳的 id 都取出來，並把這些 id 們存到一個 array 中
        // 最後 array.includes(r.id)，檢視最愛餐廳的 id 們中，是否包含 r.id (當下這筆餐廳的 id)
        // 如是則回傳 true，如否則回傳 false
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
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
        const isFavorited = req.user.FavoritedRestaurants.map(d => d.id).includes(restaurant.id)
        const isLiked = req.user.LikedRestaurants.map(d => d.id).includes(restaurant.id)
        restaurant.update({
          viewCounts: restaurant.viewCounts + 1
        }).then(restaurant => {
          return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited: isFavorited, isLiked: isLiked })
        })
      })
  },

  getFeeds: (req, res) => {
    // ① 採用 Promise 寫法，可以同時存取 Restaurant 跟 Comment，兩者都完畢後再進入到下一層 then
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
    // ② 需先存取 Restaurant，完畢後再存取 Comment，完畢後再進入到下一層 then
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
  },

  getTopRestaurant: (req, res) => {
    return Restaurant.findAll({ include: [{ model: User, as: 'FavoritedUsers' }, { model: User, as: 'LikedUsers' }] })
      .then((restaurants) => {
        restaurants = restaurants.map(restaurant => ({
          ...restaurant.dataValues,
          FavoritedCount: restaurant.FavoritedUsers.length,
          description: restaurant.description.substring(0, 50),
          isFavorited: restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id),
          isLiked:  restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
        }))
        restaurants = restaurants.sort((a, b) => b.FavoritedCount - a.FavoritedCount)
        restaurants = restaurants.slice(0, 10)
        return res.render('topRestaurant', { restaurants: restaurants })
      })
  }
}

module.exports = restController
