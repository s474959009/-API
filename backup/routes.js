


var sign_api = require('./controllers/sign_api');
var goods_api = require('./controllers/goods_api');
var util = require('./controllers/util_api');
var feedback_api = require('./controllers/feedback_api');
// var page_api = require('./controllers/page_api')

module.exports = function (app) {
	app.post('/v1/app/option',util.util)
	app.post('/v1/app/reset',sign_api.update_password);
	app.post('/v1/app/login', sign_api.login);
	app.post('/v1/app/signup',sign_api.register);
	app.post('/v1/app/logout',sign_api.logout);
	app.post('/v1/app/goods/add',goods_api.goodsAdd);
	app.post('/v1/app/goods/del',goods_api.goodsDel);
	app.post('/v1/app/goods/list',goods_api.listGoods);
	app.post('/v1/app/goods/one',goods_api.showGoods);
	app.post('/v1/app/goods/home/up',goods_api.userHomeUp);
	app.post('/v1/app/goods/home/down',goods_api.userHomeDown);
	app.post('/v1/app/goods/home/one',goods_api.showHomeGoods);
	app.post('/v1/app/goods/edit',goods_api.goodsEdit);
	app.post('/v1/app/goods/serch',goods_api.findGoods);	
	app.post('/v1/app/feedback',feedback_api.postFeedback);
	app.post('/v1/app/report',goods_api.goodsReport);
};

