var url = require('url');
var fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var imGen = require('./imageGenerator');

var mockJsonResponseController = require('./mockJsonResponseController');
var validateJsonController = require('./validateJsonController');
var swaggerResourcesController = require('./swaggerResourcesController');
var swaggerApiController = require('./swaggerApiController');
var configProjectsController = require('./configProjectsController');

var properties = require('./properties');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// prevent error messages in the console caused by missing favicon
app.get( '/favicon.ico', function ( req, res ) {
	res.set('Content-Type', 'image/x-icon');
	res.send( 200 );
	return;
});

app.all('*', function (req, res, next) {
	if (req.url.indexOf('imageGenerator') > -1 ) return next();

	var result = getController(req).handle(req);
	setTimeout(function() {
		if (result) {
			res.set({
				'Content-Type': 'application/json; charset=utf-8',
				'Access-Control-Allow-Origin': '*'
			}).send(200, JSON.stringify(result));
		} else {
			res.send(404);
		}
	}, properties.getProperty('responseDelay'));
});

app.get('/imageGenerator/:width/:height/:makeRandom?*', function(req, res) {
	var options = {
		width: req.params.width,
		height: req.params.height,
		random: req.params.makeRandom
	};

	imGen.generateImage(options, function(filepath) {
		res.set('Content-Type', 'image/jpg');
		res.sendfile(filepath, function() {
			fs.unlink(filepath);
		});
	});
});

function getController(req)
{
	var request = url.parse(req.url, true);
	var pathname = request.pathname;
	var query = request.query;
	switch (true) {
		case /\/config\/projects.*/.test(pathname):
			return configProjectsController;
			break;
		case /\/swagger\/resources\/.*/.test(pathname):
			return swaggerResourcesController;
			break;
		case /\/swagger\/api\/.*/.test(pathname):
			return swaggerApiController;
			break;
	}

	if(query.swaggerValidate == 'true')
	{
		return validateJsonController;
	}
	return mockJsonResponseController;
}

app.listen(properties.getProperty('serverPort'), properties.getProperty('serverHost'));

console.log('Server running at http://' + properties.getProperty('serverHost') + ':' + properties.getProperty('serverPort') + '/');
