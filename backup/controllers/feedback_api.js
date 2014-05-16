

var Feedback = require('../repository/feedback');
var Moment = require('moment');
var v = require('validator');


exports.postFeedback=function(req,res){
	var name = req.body.name, 
			email = req.body.email, 
			content = req.body.content, 
			date = Moment().unix();

	if(content==null){
		res.send({code:1001,desc:'信息不完整'});
		return;
	}

	if(!v.isLength(email,0,25)){
		res.send({code:3001,desc:'联系方式太长(短)'})
		return;
	}

	if(!v.isLength(content,4,500)){
  	res.send({code:2004,desc:'内容太长(短)'}); 
  	return;
	}	

  Feedback.newAndSave(name,email,content,date,function(err){
    if(err){
      res.send({code:1000,desc:'服务器内部错误'});
      return;
    }
     	res.send({code:3011,desc:'感谢反馈'});
  });
}