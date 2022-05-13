const db = require('../models')
const Category = db.Category

let categoryController = {
  getCategories: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        res.render('admin/categories', { categories: categories })
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
  }

}

module.exports = categoryController
