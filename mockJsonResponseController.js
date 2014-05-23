var fs = require('fs');
var url = require('url');
var swaggerApiHelper = require('./swaggerApiHelper');
var expressionHelper = require('./expressionHelper');
var projects = require('./projectConfiguration');

var handle = function (req) {

	var projectName = getProjectName(req);
	var project = projects.getProject(projectName);
	var model = getModelByRequest(req, project);
	var modelJson = expressionHelper.buildJsonObject(req, project, model);

	var envelope = getEnvelopeByRequest(req, project);
	if(typeof envelope !== 'undefined')
	{
		var envelopeJson = expressionHelper.buildJsonObject(req, project, envelope);
		for (var property in envelopeJson)
		{
			if (envelopeJson.hasOwnProperty(property) && typeof envelopeJson[property] !== 'function' && typeof envelopeJson[property] !== 'undefined')
			{
				var value = envelopeJson[property];
				if(value === "$inject:envelopeData")
				{
					envelopeJson[property] = modelJson;
				}
			}
		}
		modelJson = envelopeJson;
	}

	return modelJson;
};

var getProjectName = function(req) {
	var pathname = url.parse(req.url, true).pathname;
	pathname = pathname.replace('//', '/');
	var name = pathname.substr(pathname.indexOf('/')+1);
	name = name.substring(0, name.indexOf('/'));

	return name;
};

function getModelByRequest(req, project) {
	var operation = swaggerApiHelper.getApiOperationForRequest(req, project);
	var type;
	if (typeof operation !== 'undefined') {
		type = expressionHelper.generateValue(req, project, operation.type);
	}
	return swaggerApiHelper.getModelByType(req, project, type);
}

function getEnvelopeByRequest(req, project) {
	var operation = swaggerApiHelper.getApiOperationForRequest(req, project);
	var envelope;
	if (typeof operation !== 'undefined') {
		envelope = expressionHelper.generateValue(req, project, operation.envelope);
	}
	return swaggerApiHelper.getModelByType(req, project, envelope);
}

exports.handle = handle;
