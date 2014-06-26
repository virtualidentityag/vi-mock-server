var fs = require('fs');
var url = require('url');
var mockJsonResponseController = require('./mockJsonResponseController');
var flattenJson = require('./flattenJson');

var handle = function (req) {

	var modelJson = mockJsonResponseController.handle(req);
	var query = url.parse(req.url, true).query;
	var jsonToValidate = JSON.parse(decodeURIComponent(query.swaggerValidationInput));

	var report = hasSameProperties(modelJson, jsonToValidate);

	return report;
};

var hasSameProperties = function(referenceModel, modelToValidate ) {
	var referenceModelFlat = {};
	flattenJson(referenceModel, "", referenceModelFlat);
	var modelToValidateFlat = {};
	flattenJson(modelToValidate, "", modelToValidateFlat);

	var report = {};

	var result = {};
	var matchedProperties = {};
	var missingProperties = {};
	var notDefinedProperties = {};

	result["missing Properties"] = missingProperties;
	result["not defined Properties"] = notDefinedProperties;
	result["matched Properties"] = matchedProperties;

	for (var key in referenceModelFlat) {
		if (referenceModelFlat.hasOwnProperty(key) && typeof referenceModelFlat[key] !== 'function' && typeof referenceModelFlat[key] !== 'undefined') {
			if (!modelToValidateFlat.hasOwnProperty(key)) {
				missingProperties[key] = "missing";
			}
			else {
				matchedProperties[key] = "match";
			}
		}
	}

	for (var key in modelToValidateFlat) {
		if (modelToValidateFlat.hasOwnProperty(key) && typeof modelToValidateFlat[key] !== 'function' && typeof modelToValidateFlat[key] !== 'undefined') {
			if (!referenceModelFlat.hasOwnProperty(key)) {
				notDefinedProperties[key] = "not defined";
			}
		}
	}

	report["status"] = "ok";
	if(!isEmpty(missingProperties) || !isEmpty(notDefinedProperties))
	{
		report["status"] = "failed";
		report["result"] = result;
	}
	//report["reference model"] = referenceModel;
	//report["model to validate"] = modelToValidate;

	return report;
}

function isEmpty(obj) {
	for(var prop in obj) {
		if(obj.hasOwnProperty(prop))
			return false;
	}

	return true;
}

exports.handle = handle;
