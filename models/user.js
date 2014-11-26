/**
 * Model for a user.
 *
 * @class user
 * @constructor
 * @param {String} email
 * @param {String} password
 * @param {String} fname
 * @param {String} lname
 * @param {String} groups
 */

 /**
 * Constructs a new user
 *
 * @method Constructor
 *
 */
module.exports = function(sequelize, DataTypes){
  return sequelize.define('user', {
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, unique: false, allowNull: false},
    fname: {type: DataTypes.STRING, unique: false, allowNull: true},
    lname: {type: DataTypes.STRING, unique: false, allowNull: true},
    groups: {type: DataTypes.TEXT, allowNull: true}
    // Need other models before setting up relations: http://sequelizejs.com/docs/1.7.8/associations#one-to-one
  })
}
