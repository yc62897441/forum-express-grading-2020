const db = require('../models')
const Category = db.Category

let categoryController = {
  getCategories: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        res.render('admin/categories', { categories: categories })
      })
  }

}

module.exports = categoryController
