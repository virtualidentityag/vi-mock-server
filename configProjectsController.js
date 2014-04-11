var properties = require('./properties');
var projects = require('./projectConfiguration');

var handle = function (req) {
	var result = [];
	var basePath = "http://" + properties.getProperty('serverHost') + ":" + properties.getProperty('serverPort') + "/" + properties.getProperty('swaggerRessourcesPath');
	projects.getAllProjects().forEach(function (project) {

		project.resourcePath = basePath + project.id;
		result.push(project);
	});
	return result;
};
exports.handle = handle;

