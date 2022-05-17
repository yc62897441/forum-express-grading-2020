'use strict'
const bcrypt = require('bcryptjs')

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Users', [
      {
        email: 'root@example.com',
        password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
        isAdmin: true,
        name: 'root',
        image: 'https://i.imgur.com/IySNrNc.jpeg',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        email: 'user1@example.com',
        password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
        isAdmin: false,
        name: 'user1',
        image: 'https://cdn2.ettoday.net/images/5849/d5849126.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        email: 'user2@example.com',
        password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
        isAdmin: false,
        name: 'user2',
        image: 'https://i.pinimg.com/originals/cd/69/30/cd69300d48d4a5b73a034506cb4d6226.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        email: 'c',
        password: bcrypt.hashSync('c', bcrypt.genSaltSync(10), null),
        isAdmin: true,
        name: 'c',
        image: 'http://n.sinaimg.cn/translate/20170307/7Wca-fycapec2999989.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        email: 'b',
        password: bcrypt.hashSync('b', bcrypt.genSaltSync(10), null),
        isAdmin: true,
        name: 'b',
        image: 'https://auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0204/users/4d7ec63e74f2274bbc6c72c7b62dd88bb2ebf6bd/i-img900x1200-1617528513orznvn348676.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {})
  }
}
