var fs = require('fs');

var trim = function (stringValue) {
    return stringValue.replace(/^\s+|\s+$/gm, '');
  };

var endsWith = function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var getFileContentAsJson = function(file) {
    var filecontent = fs.readFileSync(file, 'utf-8');
    var apiDefinition;
    try {
        apiDefinition = JSON.parse(filecontent);
        
    }
    catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
    }

    return apiDefinition;
}

var collect = function collect(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) results = results.concat(collect(file))
        else results.push(file)
    })
    return results;
}

exports.getFileContentAsJson = getFileContentAsJson;
exports.trim = trim;
exports.endsWith = endsWith;
exports.collect = collect;
