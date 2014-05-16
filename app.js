
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');
var app = express();
var config=require('./config').config;    //获取配置文件
var mongoHelper=require('./utils/mongoUtils.js');
// all environments
app.set('view engine', 'ejs');
app.set('views',__dirname + '/views');
app.use(express.logger('dev'));
app.use(express.bodyParser({
    uploadDir: config.upload_dir    //包含上传的文件夹
}));
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
var maxAge = 3600000 * 24 * 30;

//设置session，session的设置位于cookie中间组件之后
app.use(express.session({
    secret: config.sessionSecret,
    key: config.authCookieName,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}//30 days
}));

app.use(function(req, res, next) {
    res.locals.user = req.session ? req.session.user : null;
    next();
});

app.use(app.router);

//路由设置
routes(app);

//连接到数据库
mongoHelper.connect();
http.createServer(app).listen(config.port, function(){
    console.log('Express server listening on port ' + config.port);
});
