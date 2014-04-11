var fs = require('fs');
var url = require('url');
var fileHelper = require('./fileHelper');

var getConfigFilePath = function() {
    var args = process.argv.slice(2);

    var result = "config/projects.json";
    if (args.length < 1) {
        console.warn("WARN: Argument with file path to project configuration is missing, using default: '" + result + "'");
    } else {
        result = args[0];
    }
    return result;
};

var projects = init();

var getAllProjects = function() {
	return projects;
};

var getProject = function(name) {
	var result;
	projects.forEach(function (project) {
		if(name === project.id)
		{
			result = project;
		}
	});
	return result;
};

function init() {
    var filepath = getConfigFilePath();
    var projects = fileHelper.getFileContentAsJson(filepath);
    
    console.log("read projects file " + filepath + ": " + JSON.stringify(projects));
    return projects;
};

exports.getAllProjects = getAllProjects;
exports.getProject = getProject;
