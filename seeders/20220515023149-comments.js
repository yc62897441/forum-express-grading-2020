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
    await queryInterface.bulkInsert('Comments', Array.from({ length: 5 }).map((item, index) => ({
      text: `Comment ${index}`,
      UserId: index % 2 + 1,
      RestaurantId: 204 + index,
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
