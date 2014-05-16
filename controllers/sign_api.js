var v = require('validator');
var User= require('../repository/user');
var config = require('../config').config;
var crypt=require('../utils/crypt');   				//密码加密模块
var redis = require('../utils/redis');
var guid = require('guid');
var mail = require('../services/mail');

//注册
exports.register = function (req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var re_password = req.body.re_password;

	if (email == null || password == null || re_password == null) {
    res.send({code:2, desc: '信息不完整'});
    return;
  }

	if(!v.isEmail(email)){
		res.send({code:1001,desc:'邮箱格式错误'}); 
		return;
	}

	if(!v.matches(password,/^[a-zA-Z0-9_]{5,16}$/)){
		res.send({code:1002,desc:'密码格式不对'});
		return;
	}

	if(!v.equals(password,re_password)){
		res.send({code:1003,desc:'密码不一致'});
		return;
	}

	User.getUsersByQuery({'$or': [{'email': email}]}, {}, function(err,users) {
		if(err) {
			res.send({code:0,desc:'服务器内部错误'});
			return;
		}

		if (users.length > 0) {
			res.send({code: 1004,desc:'该邮箱已注册'});
			return;
		}
		// md5密码
		password = crypt.md5(password);

		User.newAndSave(email, password, false, function(err) {
			if(err) {
				res.send({code:0,desc:'服务器内部错误'})
				return;
			}
				// 发送激活邮件
				// mail.sendActiveMail(email, crypt.md5(email + config.sessionSecret), email);
				res.send({code:1,desc:'注册成功'});

				// var key = 'count:'+email+'_total_';

				// redis.setKey(key,0,function(err){
				// 	if(err){
				// 		res.send({code:1000,desc:'服务器内部错误'});
				// 	}
				// });
		});
	});  
}

//登陆
exports.login = function (req, res) {
	var email = req.body.email;
	var password = req.body.password;

	if (email == null || password == null ) {
		res.send({code: 2, desc: '信息不完整'});
		return;
	}

	if(!v.isEmail(email)){
		res.send({code:1001,desc:'邮箱格式错误'}); 
		return;
	}	

	if(!v.matches(password,/^[a-zA-Z0-9_]{5,16}$/)){
		res.send({code:1002,desc:'密码格式不对'});
		return;
	}	

	User.getUserByEmail(email, function(err,user) {
		if(err) {
			res.send({code:0,desc:'服务器内部错误'});
			return;
		}

		if(!user) {
			res.send( {code: 1005,desc:'帐号或密码错误'});
			return;
		}

		password = crypt.md5(password);

		if (password !== user.password) {
			res.send( {code: 1006,desc:'帐号或密码错误'});
			return;
		}

		// if(!user.active) {
		// 	mail.sendActiveMail(email, crypt.md5(email + config.sessionSecret), email);
		// 	res.send({code: 1009,desc:'账户未激活，已再次发送激活邮件'})
		// 	return
		// }
		var token = guid.create();
		var inf = {
			id:user._id,
			email:user.email,
			token:token
		};

		redis.setKeyTime("user:"+user._id, token, config.redis.token_time, function(err){
			if(err){
				res.send({code:0,desc:'服务器内部错误'});
				return;
			}
			res.send({code: 1,desc:'登陆成功',user:inf});	
		});
	});
}

exports.logout = function(req, res) {
	var user_id = req.body.user_id;
	var token = req.body.token;

	if(user_id == null||token==null){
		res.send({code:2,desc:'信息不完整'});
		return;
	}

	redis.getKey("user:"+user_id,function(err,val){
	  if(err){
	    res.send({code:0,desc:'服务器内部错误'});
	    return;
	  }

	  if(val!=token){
      res.send({code:3,desc:'token失效或非法，请重新登录'});
      return;
    }

		redis.delKey("user:"+user_id,function(err){
			if(err){
				res.send({code:0,desc:'服务器内部错误'});
				return;
			}

			res.send({code:1,desc:'退出成功'});
		});
	});
}

//修改密码
exports.update_password = function (req, res) {
	var token = req.body.token;
	var user_id = req.body.user_id;
	var psw = req.body.password;
	var repsw = req.body.re_password;

	if(token == null || psw== null || repsw==null || user_id==null){
		res.send({code:2,desc:'信息不完整'});
		return;
	}

	if(!v.matches(psw,/^[a-zA-Z0-9_]{5,16}$/)){
		res.send({code:1002,desc:'密码格式不对'});
		return;
	}


	if(!v.equals(psw,repsw)){
		res.send({code:1003,desc:'密码不一致'});
		return;
	}

	redis.getKey("user:"+user_id,function(err,val){
		if(err){
			res.send({code:0,desc:'服务器内部错误'});
			return;
		}

		if(val!=token){
			res.send({code:3,desc:'token失效或非法，请重新登录'});
			return;
		}

		User.getUserById(user_id, function(err,user) {
			if(err) {
				res.send({code:0,desc:'服务器内部错误'});
				return;
			}

			if(!user) {
				res.send( {code:1005,desc:'用户不存在'});
				return;
			}

			user.password = crypt.md5(psw);
			user.save(function (err) {
				if(err) {
					res.send({code:0,desc:'服务器内部错误'});
					return;
				}
				res.send({code:1,desc:'操作成功'});
			});
		});
	});
}
