const db = require('../models')
const Category = db.Category
const Restaurant = db.Restaurant

let categoryController = {
  getCategories: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id, { raw: true, nest: true })
            .then(category => {
              res.render('admin/categories', { categories: categories, category: category })
            })

        } else {
          res.render('admin/categories', { categories: categories })
        }
      })
  },

  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    }

    return Category.create({
      name: req.body.name
    })
      .then(category => {
        res.redirect('/admin/categories')
      })
  },

  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    }

    return Category.findByPk(req.params.id)
      .then(category => {
        category.update({
          name: req.body.name
        })
      })
      .then(category => {
        res.redirect('/admin/categories')
      })
  },

  deleteCategory: async (req, res) => {
    try {
      const deleteCategoryId = req.params.id
      // 如果要刪除的是 "其他" 餐廳類別，不執行，直接return
      const result = await Category.findOne({ where: { id: deleteCategoryId } })
        .then(category => {
          if (category.name === '其他') {
            return true
          }
          return false
        })
      if (result) {
        return res.redirect('/admin/categories')
      }

      // 先找出 "其他" 餐廳類別，把接下來要刪除的餐廳類別的餐廳，都改成"其他"類別
      Category.findOne({ where: { name: '其他' } })
        .then(category => {
          // 如果 "其他" 餐廳類別不存在，則建立 "其他" 餐廳類別
          if (!category) {
            Category.create({
              name: '其他'
            })
              .then(category => {
                // 把要刪除的餐廳類別的餐廳，都改成"其他"類別
                Restaurant.findAll({ where: { CategoryId: deleteCategoryId } })
                  .then(restaurants => {
                    Promise.all(restaurants.map(restaurant => {
                      restaurant.update({
                        CategoryId: category.id
                      })
                    }))
                  })
                  .then(() => {
                    // 刪除該餐廳類別
                    Category.findOne({ where: { id: deleteCategoryId } })
                      .then(category => {
                        category.destroy()
                          .then(() => {
                            return res.redirect('/admin/categories')
                          })
                      })
                  })
              })
          } else {
            Restaurant.findAll({ where: { CategoryId: deleteCategoryId } })
              .then(restaurants => {
                // 把要刪除的餐廳類別的餐廳，都改成"其他"類別
                Promise.all(restaurants.map(restaurant => {
                  restaurant.update({
                    CategoryId: category.id
                  })
                }))
              })
              .then(() => {
                Category.findOne({ where: { id: deleteCategoryId } })
                  .then(category => {
                    // 刪除該餐廳類別
                    category.destroy()
                      .then(() => {
                        return res.redirect('/admin/categories')
                      })
                  })
              })
          }
        })
        .catch(error => {
          console.log(error)
          return res.redirect('/admin/categories')
        })
    } catch (error) {
      console.warn(error)
      return res.redirect('/admin/categories')
    }
  }
}

module.exports = categoryController
