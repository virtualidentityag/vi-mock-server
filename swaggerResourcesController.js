var url = require('url');
var fileHelper = require('./fileHelper');
var properties = require('./properties');
var projects = require('./projectConfiguration');

var handle = function(req) {

	var resourcesJson = {};
    resourcesJson["apiVersion"] = properties.getProperty('apiVersion');
    resourcesJson["swaggerVersion"] = properties.getProperty('swaggerVersion');
    resourcesJson["basePath"] = "http://" + properties.getProperty('serverHost') + ":" + properties.getProperty('serverPort') + "/";

	var projectName = getProjectName(req);
	var project = projects.getProject(projectName);
	if(typeof  project !== 'undefined')
	{
		var mockDirectory = project.mockDirectory;
		var mocks = fileHelper.collect(mockDirectory);
		var paths = [];
		mocks.forEach(function(file) {
			if(fileHelper.endsWith(file, '.json'))
			{
				paths.push({"path": file.replace(mockDirectory, properties.getProperty('swaggerApiPath') + '/' + projectName)});
			}
		});

		resourcesJson["apis"] = paths;
	}

	return resourcesJson;
}

var getProjectName = function(req) {
	var pathname = url.parse(req.url, true).pathname;
	var name = pathname.substr(pathname.lastIndexOf('/')+1);
	return name;
}

exports.handle = handle;

