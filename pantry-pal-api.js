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
  db = require('./models'), // Sequelize!
  sha256 = require('sha256');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    if(password)
      password = sha256(password);
    db.user.find({ where: {'email': email, 'password': password} }).success(function(user) {
      // project will be the first entry of the Projects table with the title 'aProject' || null
      return done(null, user);
    }).error(function(error){
      return done(null, false, error);
    })
    //return done(null, false, { message: 'No idea, bro.' });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  db.user.find(id).success(function(user) {
    // project will be the first entry of the Projects table with the title 'aProject' || null
    return done(null, user);
  }).error(function(error){
    return done(null, false, error);
  })
});

var config = {
  sequelizeJsonApi: {
      endpoint: '/v1', // the api endpoint, this is used to build resource URLs
      allowed: ['users', 'ingredients'], // a list of models to expose on the api, default so all if none specified... user should eventually be taken out
      allowOrigin: '*', // the value for the Access-Control-Allow-Origin header to support CORS
      transport: 'ember-restadapter', // the transport format to use for the api, json-api or ember-restadapter
      idValidator: function(id){return true;} //a method to validate ids, default is `validator.isInt`
  }
};

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
  var cookieParser = require('cookie-parser')
  var expressSession = require('express-session');

  // Configure express
  expressApp.set('port', (process.env.PORT || 5000)); // Port to use, process.env.PORT is set by heroku
  expressApp.use(cookieParser());
  expressApp.use( bodyParser.json() ); // JSON-encoded body support
  expressApp.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));
  expressApp.use(expressSession({secret:'somesecrettokenhere'}));
  expressApp.use(passport.initialize());
  expressApp.use(passport.session());
  expressApp.use( cors() ); // cors enables cross site scripting
  expressApp.use(compress()); // Tells Express to use gzip encryption
  return expressApp;
}

/**
 * Generates API routes for all of the ./models that are allowed in config var
 * Uses .com/v1/:resource/:id for GET, POST, PUT, DELETE
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

  server = setupExplicitApiRoutes(server);

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

/**
 * Pantry Pal restful api
 *
 * @module Routes
 * @main Routes
 * @class Routes
 */
var setupExplicitApiRoutes = function(expressApp){

  /**
   * Route to create a user
   *
   * @method route-user-create
   * @param {POST} /v2/user
   * @return void
   */
  expressApp.post('/v2/user', function(req, res) {
      var email = req.param('email', null),
          password = req.param('password', null),
          fname = req.param('fname', null),
          lname = req.param('lname', null);

      if(password){
        password = sha256(password);
      }

      // ...
      db.user
          .build({
            'email': email,
            'password': password,
            'fname': fname,
            'lname': lname,
            })
          .save()
          .success(function(savedUser) {
            res.send(savedUser);
            // you can now access the currently saved task with the variable anotherTask... nice!
          }).error(function(error) {
            res.send(error);
            // Ooops, do some error-handling
          })
  });

  /**
   * Route to update a user
   *
   * @method route-user-update
   * @param {PUT} /v2/user
   * @return void
   */
  expressApp.put('/v2/user', function(req, res) {
    if (req.session.passport.user) {
      var email = req.param('email', null),
          password = req.param('password', null),
          fname = req.param('fname', null),
          lname = req.param('lname', null);

      if(password){
        password = sha256(password);
      }

      var toUpdate = {};

      if(email)
        toUpdate.email = email;
      if(password)
        toUpdate.password = password;
      if(fname)
        toUpdate.fname = fname;
      if(lname)
        toUpdate.lname = lname;

      db.user.find(req.session.passport.user.id).success(function(user) {
        user.updateAttributes(toUpdate)
            .success(function(savedUser) {
              req.session.passport.user = savedUser;
              res.send(savedUser);
              // you can now access the currently saved task with the variable anotherTask... nice!
            }).error(function(error) {
              res.send(error);
              // Ooops, do some error-handling
            })
      }).error(function(error){
        res.send('no user');
      })
      //res.send(req.session.passport.user);
    }else{
      res.send('no auth');
    }

  });


  /**
   * Route to authenticate a user
   *
   * @method route-user-auth
   * @param {POST} /v2/user
   * @return void
   */
  expressApp.post('/v2/user/auth',
    passport.authenticate('local', { successRedirect: '/v2/user',
                                     failureRedirect: '/v1/users',
                                     failureFlash: false })
  );

  /**
   * Route to show logged in user
   *
   * @method route-user-show
   * @param {GET} /v2/user
   * @return void
   */
  expressApp.get('/v2/user',
    function(req, res, next) {
        if (req.session.passport.user) {
          res.send(req.session.passport.user);
        }else{
          res.send('error');
        }
  });

  return expressApp;
}

// run restful api with documentation
run();
