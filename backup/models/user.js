var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;

var userSchema = new Schema({
	email: {type: String, unqiue:true},       	//邮箱
	password: {type: String},                 	//密码
    state: {type: Boolean, defult:false},     	//认证状态
	active: {type:Boolean, defult:false},		//激活状态
	onumber: {type: String},                  	//授权账号
	okey: {type: String},                     	//授权key
    retrieve_time : {type: Date},       		//用户重置时间,用户确定用户激活时间
    retrieve_key : {type: String}         		//用户重置激活码
},{collection:'users'});

var User=mongoose.model('User',userSchema);

module.exports=User;