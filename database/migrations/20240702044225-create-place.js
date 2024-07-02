'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Places', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      formatted_address: {
        type: Sequelize.STRING
      },
      geometry: {
        type: Sequelize.JSON
      },
      name: {
        type: Sequelize.STRING
      },
      photos: {
        type: Sequelize.JSON
      },
      place_id: {
        type: Sequelize.STRING
      },
      rating: {
        type: Sequelize.FLOAT
      },
      user_ratings_total: {
        type: Sequelize.INTEGER
      },
      website: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Places');
  }
};