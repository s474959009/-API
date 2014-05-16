var crypto = require('crypto');

//Md5 加密
exports.md5 = function(str){
	var md5sum = crypto.createHash('md5');
		md5sum.update(str);
		str = md5sum.digest('hex');
	return str;
}

