var url = require('url');
var loremIpsum = require('lorem-ipsum');
var swaggerApiHelper = require('./swaggerApiHelper');
var properties = require('./properties');
var casual = require('casual');
var extend = require('extend');

extend(true, exports, casual);

exports.randomString = function (req, project, length) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
};

exports.randomColor = function () {
	return '#' + Math.random().toString(16).slice(2, 8);
};

exports.loremIpsum = function (req, project, min, max) {
	min = min || exports.randomNumber(req, project, 1, 20);
	max = max || min;
	var count = exports.randomNumber(req, project, min, max);

	return loremIpsum({
		count: count          // Number of words, sentences, or paragraphs to generate.
		, units: 'words'
	});
};

exports.randomOption = function (req, project, options) {
	return options[exports.randomNumber(req, project, 0, options.length-1)];
};

exports.randomBoolean = function (req, project) {
	return exports.randomNumber(req, project, 0, 1)<.5;
};

exports.randomTimestamp = function (req, project, start, end) {
	var now = new Date();
	var variant = exports.randomNumber(req, project, now.getTime() - 1000 * 60 * 60 * 24 * 30, now.getTime());
	var someDaysAgo = new Date(variant);
	start = parseDate(start) || someDaysAgo;
	end = parseDate(end) || now;
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

exports.randomUnixTimestamp = function (req, project) {
	return Math.round(exports.randomTimestamp(req, project).getTime()/1000);
};

function parseDate(date)
{
	var parsedDate;
	if(typeof date !== 'undefined')
	{
		var dateRegex = new RegExp(/(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/);
		var m = dateRegex.exec(date);
		var year = m[1];
		var month = m[2];
		var day = m[3];
		var hour = m[4];
		var minute = m[5];
		var second = m[6];
		parsedDate = new Date(year, month, day, hour, minute, second);
	}
	return parsedDate;
}

exports.timestamp = function (req, project) {
	return new Date();
};

exports.randomUUID = function (req, project) {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
};

exports.statuscode = function (req, project) {
	return 200;
};

exports.randomNumber = function (req, project, min, max) {
	min = parseInt(min);
	max = parseInt(max);
	return (Math.floor(Math.random() * (max - min + 1)) + min);
};

exports.pathVariable = function (req, project, name) {
	var value;
	var api = swaggerApiHelper.getApiElementForRequest(req, project);
	if(typeof api !== 'undefined')
	{
	
		var pattern = '\\{' + name + '\\}';
		var regexPathVariable = new RegExp(pattern);
		var apiPath = '/' + project.id + api.path;
		if(apiPath.match(regexPathVariable))
		{
			var match = regexPathVariable.exec(apiPath);
			var position = apiPath.indexOf(match[0]);

			var pathname = url.parse(req.url, true).pathname;
			value = pathname.substring(position + 1);
			position = value.indexOf("/");
			if(position > 0)
			{
				value = value.substring(0, position);
			}
			else
			{
				position = value.indexOf("?");
				if(position > 0)
				{
					value = value.substring(0, position);
				}
			}
		}
	}

	return value;
};

exports.parameter = function (req, project, name) {
	var value;
	
	var q = url.parse(req.url, true).query;
	for(var key in q) {
		if(q.hasOwnProperty(key) && typeof q[key] !== 'undefined' && key === name) {
			value = q[key];
			break;
		}
	}

	return value;
};

exports.imagePath = function (req, project, wid, hei, randomImage) {
	wid = parseInt(wid);
	hei = parseInt(hei);
	return 'http://' + properties.getProperty('serverHost') + ':' + properties.getProperty('serverPort') + '/imageGenerator/' + wid + '/' + hei + ((!!randomImage) ? '/random' : '') ;
};
