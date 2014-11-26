/**
 * Sequelize configuration
 *
 * @class Sequelize
 * @constructor
 */

 /**
 * Sets db info using pantry-pal-api/config/database.json,
 * sets up configured models, and other sequelized-specific configuration
 *
 * @method Constructor
 */
if (!global.hasOwnProperty('db')) {
  var Sequelize = require('sequelize')
    , sequelize = null

  if (process.env.DATABASE_URL) {
    // the application is executed on Heroku ... use the postgres database
    var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)

    sequelize = new Sequelize(match[5], match[1], match[2], {
      dialect:  'postgres',
      protocol: 'postgres',
      port:     match[4],
      host:     match[3],
      logging:  false //false
    })
  } else if (process.env.CLEARDB_DATABASE_URL) {
    // the application is executed on Heroku ... use the postgres database
    var match = process.env.CLEARDB_DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)?(.+)/)

    var user = match[1],
        password = match[2],
        hostname= match[3],
        table_name = match[4]

    sequelize = new Sequelize(match[4], match[1], match[2], {
      dialect:  'mysql',
      protocol: 'mysql',
      host:     match[3],
      logging:  false //false
    })
  } else {
    var fs = require('fs');
    var dbInfo = JSON.parse(fs.readFileSync('./config/database.json', 'utf8'));
    // the application is executed on the local machine ... use mysql
    sequelize = new Sequelize(dbInfo.dbName, dbInfo.dbUser , dbInfo.dbPassword, {
      dialect:  dbInfo.connectionInfo.dialect,
      protocol: dbInfo.connectionInfo.protocol,
      port:     dbInfo.connectionInfo.port,
      host:    dbInfo.connectionInfo.host,
      logging:  dbInfo.connectionInfo.logging
    }
  );
  }

  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    ingredient:      sequelize.import(__dirname + '/ingredient'),
    user:      sequelize.import(__dirname + '/user')
    // add your other models here
  }


  /*
    Associations can be defined here. E.g. like this:
    global.db.User.hasMany(global.db.SomethingElse)
  */
}

module.exports = global.db
