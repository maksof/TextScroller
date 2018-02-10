
// Reference to the module to be exported
contentServer = module.exports = {};

contentServer.setup = function( app ) {
	// Get the configurations
	var config = require( __dirname + '/../config' );

	// Serve the libs folder
	var express = require('express');	
	
  	app.use( '/', express.static( __dirname + '/../../../client/application/' ));

	app.use( '/version',  function(req, res) {
	  res.send("var version = '" + app.locals.version + "';" + "var env = '" + config.app.mode.current + "';");
	});

	// Generate error to test correct handling
	app.get( config.app.errorUrl, function(req, res) {
	    throw 'This is a generated error. All requests to this URL will always throw this error';
	});
}
