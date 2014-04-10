var fs = require('fs');
var url = require('url');
var fileHelper = require('./fileHelper');

var projects = init();

var getAllProjects = function() {
	return projects;
}

var getProject = function(name) {
	var result;
	projects.forEach(function (project) {
		if(name === project.id)
		{
			result = project;
		}
	});
	return result;
}

function init() {
    var filepath = "config/projects.json";
    var projects = fileHelper.getFileContentAsJson(filepath);
    
    console.log("read projects file " + filepath + ": " + JSON.stringify(projects));
    return projects;
}

exports.getAllProjects = getAllProjects;
exports.getProject = getProject;

