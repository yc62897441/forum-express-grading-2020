const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    })
      .then((comment) => {
        res.redirect(`/restaurants/${req.body.restaurantId}`)
      })
  },

  deleteComment: (req, res) => {
    Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
          .then((comment) => {
            res.redirect(`/restaurants/${comment.RestaurantId}`)
          })
      })
    // https://lighthouse.alphacamp.co/courses/43/units/6380
    // 第二個.then 當中的 comment ，是第一個.then 的回傳值，也就是 comment.destroy() 的回傳值，「剛好」就是 comment 自已。
    // 如果像下面這樣回傳不同的東西，那麼第二個 .then 當中的 comment 就會是 {message: 'hello world'}，程式就會爆炸囉
    // deleteComment: (req, res) => {
    //     const { id } = req.params
    //     return Comment.findByPk(id)
    //       .then(comment => {
    //          comment.destroy()
    //          return {message: 'hello world'}
    //     })
    //       .then(comment => res.redirect(`/restaurants/${comment.RestaurantId}`))
    //   }
  }
}

module.exports = commentController
