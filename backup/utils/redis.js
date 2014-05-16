var redis = require('redis');
var config = require('../config').config.redis;
var client  = redis.createClient(config.port, config.db);

client.on('error', function (err) {
    return err;
});
	  
exports.setKeyTime = function(key, val, time, callback){  
  client.setex(key, time, val, callback); 
}  

exports.setKey = function(key, val, callback){
	client.set(key, val, callback);
}

exports.getKey = function(key, callback){  
  client.get(key, callback);  
};

exports.delKey = function(key, callback){
	client.del(key,callback)
}

exports.delKeys = function(callback){
	client.keys(["list:*"], function (err, replies) {
    	client.del(replies,callback);
	});
}

exports.delKeyUser = function(key,callback){
	client.keys(key,function (err, replies) {
		client.del(replies,callback);
	});
} 

exports.incrValue = function(key,callback){
	client.incr(key,callback);
}

exports.decrValue = function(key,callback){
	client.decr(key,callback);
}
