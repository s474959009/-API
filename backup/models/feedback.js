var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;

var feedbackSchema=new Schema({
    name:String,
    email:String,
    content:String,
    status:Number,
    date:Number
},{collection:'feedback'});

var Feedbacks=mongoose.model('feedback',feedbackSchema);

module.exports=Feedbacks;
