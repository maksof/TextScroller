
// Get the configurations
var config = require( __dirname + '/config' );

// Our logger for logging to file and console
var logger = require( __dirname + '/logger' );

// Instance for express server
var express = require( 'express' );
var cookieParser = require('cookie-parser');
var session = require('express-session');

var bodyParser = require('body-parser');

var app = module.exports =express();

app.use(cookieParser());
app.use(session({
	secret: '1234567890QWERTY',
	resave: true,
    saveUninitialized: true
}));

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json 
app.use(bodyParser.json())

var contentServer = require( __dirname + '/providers/StaticContentServer' );
contentServer.setup( app );

var readFile = require( __dirname + '/providers/readfile' );
readFile.setup( app );

// Start the http server
var httpServer;

var http = require('http');
var open = require('open');
httpServer = http.createServer(app);
// Make the server listen
//httpServer.listen( config.http.port );

httpServer.once('error', function(err) {
  if (err.code === 'EADDRINUSE') {
    logger.info( 'Already Listening on port ' + config.http.port + ' with SSL ' + config.http.enableSSL + ". Relaunching it now!");
  	open('http://localhost:'+config.http.port+'/');
  }
});

httpServer.once('listening', function() {
  logger.info( 'Listening on port ' + config.http.port + ' with SSL ' + config.http.enableSSL );
  open('http://localhost:'+config.http.port+'/');
});

httpServer.listen(config.http.port, '127.0.0.1');

