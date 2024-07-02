'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserFavoritePlace extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserFavoritePlace.init({
    userId: DataTypes.INTEGER,
    placeId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserFavoritePlace',
  });
  return UserFavoritePlace;
};