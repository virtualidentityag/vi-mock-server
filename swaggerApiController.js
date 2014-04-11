var fs = require('fs');
var properties = require('./properties');
var fileHelper = require('./fileHelper');
var projects = require('./projectConfiguration');
var expressionHelper = require('./expressionHelper');

var handle = function (req) {

	var apiJson = {};
	apiJson["apiVersion"] = properties.getProperty('apiVersion');
	apiJson["swaggerVersion"] = properties.getProperty('swaggerVersion');
	apiJson["basePath"] = "http://" + properties.getProperty('serverHost') + ":" + properties.getProperty('serverPort') + "/";
	apiJson["resourcePath"] = properties.getProperty('swaggerRessourcesPath');
	apiJson["produces"] = ["application/json"];

	var projectName = getProjectName(req);
	var project = projects.getProject(projectName);
	var filepath = req.url.replace('/' + properties.getProperty('swaggerApiPath') + '/' + projectName, project.mockDirectory);
	var resourcesJson = fileHelper.getFileContentAsJson(filepath);
	if (typeof resourcesJson !== 'undefined') {

		resourcesJson.apis.forEach(function(api) {
			api.path = '/' + projectName + api.path;
		});

		var apis = resourcesJson.apis;
		for (var api in apis)
		{
			handleApi(req, project, apis, api);
		}
		apiJson["apis"] = apis;

		var models = resourcesJson.models;
		for (var modelName in models)
		{
			handleModel(models, modelName);
		}

		apiJson["models"] = resourcesJson.models;
	}

	return apiJson;
};

var handleApi = function(req, project, apis, index) {
	apis[index].operations[0].type = expressionHelper.generateValue(req, project, apis[index].operations[0].type);
};

var handleModel = function(models, modelName) {
	var combinedModel = {};
	if (typeof models[modelName] !== 'undefined') {
		var currentModel = models[modelName];
		if(typeof currentModel.extends !== 'undefined')
		{
			// handle extended model -> fetch parent model properties
			var parentModel = handleModel(models, currentModel.extends);
			for (var attrname in parentModel) {
				combinedModel[attrname] = parentModel[attrname];
			}
		}

		for (var attrname in currentModel.properties) {
			combinedModel[attrname] = currentModel.properties[attrname];
		}
		currentModel.properties = combinedModel;
	}

	return combinedModel;
};

var getProjectName = function(req) {
	var path = req.url.replace('/' + properties.getProperty('swaggerApiPath') + '/', '');
	var name = path.substring(0, path.lastIndexOf('/'));
	return name;
};

exports.handle = handle;

