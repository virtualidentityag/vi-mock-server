var fs = require('fs');
var crypto = require('crypto');
var im = require('imagemagick');

exports.generateImage = function(options, callback) {
	options.random = options.random || false;
	options.width = options.width || 300;
	options.height = options.height || 200;

	var randomColor = (options.random) ? 'rgb(' + Math.floor(Math.random() * 128) + ', ' + Math.floor(Math.random() * 128) + ', ' + Math.floor(Math.random() * 128) + ')' : 'black';

	var cachedFilename = '#' + crypto.createHash('md5' ).update(options.width + 'x' + options.height + 'c' + randomColor).digest('hex') + '#';
	fs.exists('./generatedImages/' + cachedFilename, function(exists) {
		if (exists) {
			callback('./generatedImages/temp/' + cachedFilename);
		} else {
			im.convert(
				[
					'./generatedImages/blank.png',
					'-size', options.width + 'x' + options.height,
					'pattern:GRAY50',
					'-fill',
					randomColor,
					'-opaque',
					'black',
					'-font',
					'Arial',
					'-pointsize',
					Math.floor(options.width / 5),
					'-fill',
					'gray40',
					'-gravity',
					'center',
					'-draw',
					'text 0,0 "' + options.width + ' x ' + options.height + '"',
					'./generatedImages/temp' + options.width + 'x' + options.height + 'c' + randomColor + '.jpg'
				], function(err) {
					if (err) throw err;
					fs.rename('./generatedImages/temp' + options.width + 'x' + options.height + 'c' + randomColor + '-1.jpg', './generatedImages/temp/' + cachedFilename, function() {
						fs.unlink('./generatedImages/temp' + options.width + 'x' + options.height + 'c' + randomColor + '-0.jpg');
						callback('./generatedImages/temp/' + cachedFilename);
					});
				}
			);
		}
	});
};
