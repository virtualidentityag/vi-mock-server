var fs = require('fs');
var fileHelper = require('./fileHelper');

var properties = init();

exports.getProperty = function(name) {
  return properties[name];
}

function init() {
    var filepath = "config/config.json";
    var properties = fileHelper.getFileContentAsJson(filepath);
    
    console.log("read properties file " + filepath + ": " + JSON.stringify(properties));
    return properties;
}
