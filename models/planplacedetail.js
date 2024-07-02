'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlanPlaceDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PlanPlaceDetail.init({
    planId: DataTypes.INTEGER,
    placeId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    indexOfDate: DataTypes.INTEGER,
    averageTime: DataTypes.FLOAT,
    fromTime: DataTypes.STRING,
    nextTime: DataTypes.STRING,
    position: DataTypes.INTEGER,
    currentDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PlanPlaceDetail',
  });
  return PlanPlaceDetail;
};