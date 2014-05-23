var url = require('url');
var fileHelper = require('./fileHelper');

var getApiElementForRequest = function(req, project) {
    var pathname = url.parse(req.url, true).pathname;

	var mocks = fileHelper.collect(project.mockDirectory);
    
    var value;
	var lengthOfMatch = 0;
    mocks.forEach(function(file) {
		var apiDefinition = fileHelper.getFileContentAsJson(file);
		if(typeof apiDefinition !== 'undefined') {
		  apiDefinition.apis.forEach(function(api) {
			var replacedPath = api.path.replace(/\{(.*)\}/, '.*');
			var regex = new RegExp(replacedPath);
			if(pathname.match(regex) && replacedPath.length > lengthOfMatch )
			{
				value = api;
				lengthOfMatch = replacedPath.length;
			}
		  });
		}
    });
    return value;
};

var getApiOperationForRequest = function(req, project) {
	var element = getApiElementForRequest(req, project);
	var requestOperation;
	element.operations.forEach(function(operation) {
		if(operation.method === req.method)
		{
			requestOperation = operation;
		}
	});
	return requestOperation;
};

var getModelByType = function getModelByType(req, project, type) {
	var model;

	if (typeof type !== 'undefined') {
		var mocks = fileHelper.collect(project.mockDirectory);

		mocks.forEach(function (file) {
			var apiDefinition = fileHelper.getFileContentAsJson(file);
			if (typeof apiDefinition !== 'undefined' && typeof apiDefinition.models[type] !== 'undefined') {
				var modelDefinition = apiDefinition.models[type];

				var parentModel;
				if(typeof modelDefinition.extends !== 'undefined')
				{
					// handle extended model -> fetch parent model properties
					var parentModelName = modelDefinition.extends;
					if (typeof apiDefinition.models[parentModelName] !== 'undefined') {
						parentModel = getModelByType(req, project, parentModelName);
					}
				}

				var currentModel = modelDefinition.properties;
				model = {};
				for (var attrname in parentModel) {
					model[attrname] = parentModel[attrname];
				}
				for (var attrname in currentModel) {
					model[attrname] = currentModel[attrname];
				}
			}
		});
	}
	return model;
};

exports.getApiElementForRequest = getApiElementForRequest;
exports.getApiOperationForRequest = getApiOperationForRequest;
exports.getModelByType = getModelByType;
