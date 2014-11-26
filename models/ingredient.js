/**
 * Model for an ingredient.
 *
 * @class ingredient
 * @constructor
 * @param {String} name
 * @param {Text} description
 */

 /**
 * Constructs a new ingredient
 *
 * @method Constructor
 *
 */
module.exports = function(sequelize, DataTypes){
  return sequelize.define("ingredient", {
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: true}
    // Need other models before setting up relations: http://sequelizejs.com/docs/1.7.8/associations#one-to-one
  })
}
