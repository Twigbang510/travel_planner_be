'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PlanPlaceDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      planId: {
        type: Sequelize.INTEGER
      },
      placeId: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      indexOfDate: {
        type: Sequelize.INTEGER
      },
      averageTime: {
        type: Sequelize.FLOAT
      },
      fromTime: {
        type: Sequelize.STRING
      },
      nextTime: {
        type: Sequelize.STRING
      },
      position: {
        type: Sequelize.INTEGER
      },
      currentDate: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('PlanPlaceDetails');
  }
};