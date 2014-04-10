var functions = require('./functions');
var fileHelper = require('./fileHelper');
var swaggerApiHelper = require('./swaggerApiHelper');

var referenceRegex = new RegExp(/\$ref\:(\w.*)/);
var functionWithArrayParameterRegex = new RegExp(/(\w.*)\(\[(.*)\]\)/);
var functionWithParameterRegex = new RegExp(/(\w.*)\((.*)\)/);
var functionNoParameterRegex = new RegExp(/(\w.*)\(\)/);

var buildJsonObject = function buildJsonObject(req, project, model) {
	var jsonObject = {};
	for (var key in model) {
		if (model.hasOwnProperty(key) && typeof model[key] !== 'function' && typeof model[key] !== 'undefined') {
			var value = model[key].mockValue;

			var generatedValue = generateValue(req, project, value);
			if (typeof value !== 'undefined') {
				jsonObject[key] = generatedValue;
			}
		}
	}

	return jsonObject;
};

var generateValue = function generateValue(req, project, value) {
	var generatedValue;
	if (typeof value === 'undefined') {
		return generatedValue;
	}

	if (Object.prototype.toString.call(value) === '[object Array]') {
		// handle arrays
		var valuesJson = [];
		for (var i = 0; i < value.length; i++) {
			var arrayValue = generateValue(req, project, value[i]);
			valuesJson.push(arrayValue);
		}
		generatedValue = valuesJson;

	}
	else if (typeof value === 'object') {
		// handle object by recursion, build json for this object
		generatedValue = generateValueForObject(req, project, value);
	}
	else if (isFinite(String(value))) {
		// handle a numeric value
		generatedValue = value;
	}

	else {
		// handle strings

		var values = value.split('||');
		for (var i = 0; i < values.length; i++) {
			var trimmedValue = fileHelper.trim(values[i]);

			if (trimmedValue.match(referenceRegex)) {
				// handle a reference to a defined model
				var m = referenceRegex.exec(trimmedValue);
				var type = m[1];
				var model = swaggerApiHelper.getModelByType(req, project, type);

				generatedValue = buildJsonObject(req, project, model);
			}
			else if (trimmedValue.match(functionNoParameterRegex)) {
				// handle a function call without parameters
				var m = functionNoParameterRegex.exec(trimmedValue);
				var functionName = m[1];
				generatedValue = executeFunctionByName(functionName, functions, req, project);
			}
			else if (trimmedValue.match(functionWithArrayParameterRegex)) {
				// handle a function call with array parameter
				var m = functionWithArrayParameterRegex.exec(trimmedValue);
				var functionName = m[1];
				var functionVariables = m[2].split(',');
				generatedValue = executeFunctionByName(functionName, functions, req, project, functionVariables);
			}
			else if (trimmedValue.match(functionWithParameterRegex)) {
				// handle a function call with parameters
				var m = functionWithParameterRegex.exec(trimmedValue);
				var functionName = m[1];
				var functionVariables = m[2].split(',');
				generatedValue = executeFunctionByName(functionName, functions, req, project, functionVariables[0], functionVariables[1], functionVariables[2]);
			}
			else {
				// handle simple string trimmedValues
				generatedValue = trimmedValue;
			}

			if (typeof generatedValue !== 'undefined') {
				break;
			}
		}


	}

	console.log("generate value: " + value + ": " + generatedValue);

	return generatedValue;
};

var generateValueForObject = function generateValueForObject(req, project, model) {
	var jsonObject = {};
	for (var key in model) {
		if (model.hasOwnProperty(key) && typeof model[key] !== 'function' && typeof model[key] !== 'undefined') {
			var value = model[key];

			var generatedValue = generateValue(req, project, value);
			if (typeof value !== 'undefined') {
				jsonObject[key] = generatedValue;
			}
		}
	}

	return jsonObject;
};

var executeFunctionByName = function executeFunctionByName(functionName, context, req, project /*, args */) {
	var args = Array.prototype.slice.call(arguments, 4);
	args.unshift(project);
	args.unshift(req);

	try {
		return context[functionName].apply(this, args);
	} catch (err) {
		var customFunctions = require(project.mockDirectory + '/customFunctions');
		try {
			return customFunctions[functionName].apply(this, args);
		} catch (err) {
			console.log("error while executeFunctionByName (" + functionName + "): " + err);
			return "unknown function " + functionName;
		}
	}
};

exports.buildJsonObject = buildJsonObject;
exports.generateValue = generateValue;
