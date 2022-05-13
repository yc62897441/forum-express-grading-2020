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
  }
}

module.exports = categoryController
