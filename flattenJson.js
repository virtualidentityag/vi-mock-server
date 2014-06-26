module.exports = flattenJSON;

function flattenJSON(json, prefix, env){

	for(key in json){

		var item = json[key];

		if (typeof item == 'object'){

			flattenJSON(item, key + '.', env);
		} else {

			env[prefix + key] = json[key];
		}
	};

	return env;
}
