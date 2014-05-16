var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;

var reportsSchema = new Schema({
	goods_id:String,
	re_content:String
},{collection:'reports'});

var Reports = mongoose.model('Reports',reportsSchema);

module.exports=Reports;