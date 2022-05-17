'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Comments', Array.from({ length: 10 }).map((item, index) => ({
      text: `Comment ${index}`,
      UserId: index % 3 + 1,
      RestaurantId: Math.floor(Math.random() * 10) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    )
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
