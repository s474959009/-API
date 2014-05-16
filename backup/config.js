var path=require('path');
exports.config={
  name:'郑大街',
  sessionSecret: 'shop',        //会话
  authCookieName: 'shop',      //验证
  hostname: '127.0.0.1',           //ip地址
  port: 3000,                    //访问端口
  db: 'mongodb://localhost/shop',   //数据库,
  connectDb:'shop',
  mailOpts:{
      host: 'smtp.126.com', //qq smtp服务器
      port: 25,               //端口号
      auth: {
          user: 's474959009@126.com',   //用户名
          pass: '199445'         //密码
      }
  },
  redis:{
    port:6379,
    db:'127.0.0.1',
    token_time:604800,
    list_time:180,
    goods_time:3
  }
};
