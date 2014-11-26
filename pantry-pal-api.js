/**
 * Pantry Pal restful api
 *
 * @module pantry-pal-api
 * @main pantry-pal-api
 * @class pantry-pal-api
 */

// New relic does our performance and avaliability testing/analytics
// This should be the first statement in index.
require('newrelic');

// Import the npm modules we need to use
var express = require('express'), // Express is the server provider
  http = require('http'), // node's http system
  db = require('./models'); // Sequelize!

var config = {
  sequelizeJsonApi: {
    endpoint: '/api', // needed for href calculation
  }
};

/**
 * Generates API routes for all of the ./models that are allowed in config var
 *
 * @method generateApiRoutes
 * @param {Json} sequelizeJsonApiConfig
 * @return void
 */
var generateApiRoutes = function(sequelizeJsonApiConfig){
  // Configure the api
  var apiRoutes = api = require('sequelize-json-api'); // api mod
  apiRoutes = api(db.sequelize, sequelizeJsonApiConfig);
  //Generate routes for models in config
  apiRoutes.initialize();
  return apiRoutes;
}

/**
 * Configure Express server to use Heroku port or 5000, use gzip compression, automatgickly
 * parse json requests to get  js object, and accept url-encodingsds
 *
 * @method setupExpress
 * @param {Object} express
 * @return void
 */
var setupExpress = function(expressApp){
  var compress = require('compression'), // this compresses stuff
      bodyParser = require('body-parser'), // So we can parse the various formats we will recieve
      cors = require('cors');
  // Configure express
  expressApp.set('port', (process.env.PORT || 5000)); // Port to use, process.env.PORT is set by heroku
  expressApp.use(compress()); // Tells Express to use gzip encryption
  expressApp.use( bodyParser.json() ); // JSON-encoded body support
  expressApp.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));
  expressApp.use( cors() ); // cors enables cross site scripting
  return expressApp;
}

/**
 * Tell express how to serve routes for .com/, and serve a restful api interface
 * of all the models configured in ./models as .com/v1
 *
 * @method setupRouting
 * @param {Object} express
 * @return void
 */
var setupRouting = function(expressApp, apiRoutes){
  // Serve documentation
  expressApp.use('/', express.static(__dirname + '/docs'));
  // Use api routes
  expressApp.use('/v1', apiRoutes);
  return expressApp;
};

/**
 * Runs pantry-pal-api by setting up express, building api routes, and seting up
 * the database to start serving Pantry Pal and all it's goodness
 *
 * @method run
 * @return void
 */
var run = function(){
  var server = express();

  server = setupExpress(server);

  var apiRoutes = generateApiRoutes(config.sequelizeJsonApi);
  server = setupRouting(server, apiRoutes);

  // Sync the database and start start listening so we can respond to requests
  db.sequelize.sync().complete(function(err) {
    if (err) {
      throw err[0];
    } else {
      http.createServer(server).listen(server.get('port'), function(){
        console.log('Express server listening on port ' + server.get('port'));
      });
    }
  });
};

// run restful api with documentation
run();
