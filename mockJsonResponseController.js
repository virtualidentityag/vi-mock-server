var fs = require('fs');
var url = require('url');
var _ = require('lodash-node');
var swaggerApiHelper = require('./swaggerApiHelper');
var expressionHelper = require('./expressionHelper');
var projects = require('./projectConfiguration');

var handle = function (req) {

	var projectName = getProjectName(req);
	var project = projects.getProject(projectName);
	var validatedParamsJson = validateParams(req, project);
	if(validatedParamsJson.status === 'success'){
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
	}else{
		return validatedParamsJson;
	}

};

var getProjectName = function(req) {
	var pathname = url.parse(req.url, true).pathname;
	pathname = pathname.replace('//', '/');
	var name = pathname.substr(pathname.indexOf('/')+1);
	name = name.substring(0, name.indexOf('/'));

	return name;
};

function validateParamsSpecified(spec, params) {
	var errors = [];
	_.each(params, function(param){
		var found = _.find(spec, function(paramSpec){
			return param === paramSpec.name;
		});
		if(!found){
			errors.push({
				parameter : param,
				message : 'provided parameter not found in API specification'
			});
		}else if(found.paramType === 'path'){
			errors.push({
				parameter : param,
				message : 'path parameter provided as query string or form parameter'
			});
		}
	});
	return errors;
}

function validateParamsRequired(spec, params) {
	var errors = [];
	_.each(spec, function(paramSpec){
		if(paramSpec.required && paramSpec.paramType !== 'path'){
			var found = _.find(params, function(param){
				return param === paramSpec.name;
			});
			if(!found){
				errors.push({
					parameter : paramSpec.name,
					message : 'required ' + paramSpec.paramType + ' parameter not provided with the request'
				});
			}
		}
	});
	return errors;
}

function validateParamsInPath(specPath, path) {
	var errors = [];
	var regexPathParam = /^\{.+\}$/;
	var regexLeadingSlashes = /^\/+/;
	var _specPath = specPath.replace(regexLeadingSlashes, '').split('/').reverse();
	var _path = path.replace(regexLeadingSlashes, '').split('/').reverse();
	_.each(_specPath, function(segment, idx){
		if(segment.match(regexPathParam)){
			if(!_path[idx]){
				errors.push({
					parameter : segment,
					message : 'path parameter not provided with the request'
				});
			}
		}else{
			if(segment !== _path[idx]){
				errors.push({
					parameter : segment,
					message : 'segment was not found in request path',
					specPath: _specPath,
					path: _path
				});
			}
		}
	});
	return errors;
}

function validateParams(req, project) {
	var api = swaggerApiHelper.getApiElementForRequest(req, project);
	var ops = swaggerApiHelper.getApiOperationForRequest(req, project);
	var errors = [];
	var params = _.keys(url.parse(req.url, true).query); // query string params
	params = params.concat(_.keys(req.body)); // form params
	var path = url.parse(req.url, true).pathname;
	try{
		var spec = ops.parameters;
		errors = errors.concat(validateParamsSpecified(spec, params));
		errors = errors.concat(validateParamsRequired(spec, params));
		errors = errors.concat(validateParamsInPath(api.path, path));
	}catch(ex){
		return {
			status: 'error',
			message: ex.message
		};
	}
	return errors.length ? {
		status: 'fail',
		message: 'the provided parameters did not match the API specification',
		errors: errors
	} : {status: 'success'};
}

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
