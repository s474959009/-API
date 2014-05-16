var mailer = require('nodemailer');
var config = require('../config').config;
var transport = mailer.createTransport('SMTP',config.mailOpts);
var SITE_ROOT_URL = 'http://' + config.hostname + (config.port !== 80? ':' + config.port : '');


var sendMail = function (data) {
  transport.sendMail(data, function (err) {
    if (err) {
      console.log(err);
    }
  });
};
/**
 * 发送激活通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 * @param {String} email 接受人的邮件地址
 */

 exports.sendActiveMail = function(who, token, email) {
 	var from = config.mailOpts.auth.user;
 	var to = who;
 	var subject = '郑大街账号激活';
 	var content = '<p>你好：</p>' +
 		'<p>我们收到你在郑大街的注册信息，请点击下面的链接来激活账户：</p>' +
 		'<a href="' + SITE_ROOT_URL + '/active_account?key=' + token + '&email=' + email + '">激活链接</a>' +
 		'<p>郑大街</p>';
  sendMail({
 		from: from,
 		to: to,
 		subject: subject,
 		html: content
 	});

};

 /**
 * 发送密码重置通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 */
exports.sendResetPasswordMail = function (who, token, email) {
  var from = config.mailOpts.auth.user;
  var to = who;
  var subject = '郑大街密码重置';
  var content = '<p>你好：</p>' +
    '<p>我们收到你在郑大街重置密码的请求，请在24小时内单击下面的链接来重置密码：</p>' +
    '<a href="' + SITE_ROOT_URL + '/resetPwd?key=' + token + '&email=' + email + '">重置密码链接</a>' +
    '<p>郑大街</p>';
  sendMail({
    from: from,
    to: to,
    subject: subject,
    html: content
  });
};
