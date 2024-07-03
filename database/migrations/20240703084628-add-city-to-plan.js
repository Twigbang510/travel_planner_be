'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Plans', 'city', {
      type: Sequelize.STRING,
      allowNull: true, 
      defaultValue: null, 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Plans', 'city');
  }
};

