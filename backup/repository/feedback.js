

var Feedback=require('../models/feedback');

//发布
exports.newAndSave = function(name, email, content, date, callback){
	var feedback = new Feedback();
	feedback.name = name;
	feedback.email = email;
	feedback.content = content;
	feedback.status = 1;
	feedback.date = date;
	feedback.save(callback);
};
