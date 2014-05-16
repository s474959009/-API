
var dburl =require('../config').config.db;//数据库地址
var mongoose = require('mongoose');
//连接地址
exports.connect = function() {
    mongoose.connect(dburl, function (err) {
       if(err)
        {
            console.error('mongodb connect error: ', err.message);
        }
        else{
            console.log('connected to mongodb');
        }
    });
}