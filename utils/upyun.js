/*upyun api*/

var Crypto = require('crypto');
var http = require('http');

exports.MD5=function(string){
    var md5sum = Crypto.createHash('md5');
    md5sum.update(string, 'utf8');
    return md5sum.digest('hex');
}

exports.Base64=function(string){
    var buffer = new Buffer(string,'utf-8');
    return buffer.toString('base64');
}

