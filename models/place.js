'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Place extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Place.init({
    formatted_address: DataTypes.STRING,
    geometry: DataTypes.JSON,
    name: DataTypes.STRING,
    photos: DataTypes.JSON,
    place_id: DataTypes.STRING,
    rating: DataTypes.FLOAT,
    user_ratings_total: DataTypes.INTEGER,
    website: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Place',
  });
  return Place;
};