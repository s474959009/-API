var Goods = require('../repository/goods');
var User = require('../repository/user');
var v = require('validator');
var Moment = require('moment');
var redis = require('../utils/redis');
var config = require('../config').config;
var time = require('../utils/time');

//物品post 
exports.goodsAdd = function(req, res) {
  var g_name = req.body.g_name,
      category = req.body.category,
      price = req.body.price,
      url = req.body.url.split(","),
      describe = req.body.describe,
      name = req.body.name,
      addr = req.body.addr,
      qq = req.body.qq,
      phone = req.body.phone,
      token = req.body.token,
      user_id = req.body.user_id,
      date = Moment().unix();

  if(g_name == null || category == null || price == null || url == null || describe == null || name == null || addr == null ||  token == null ||user_id==null){
    res.send({code:2,desc:'信息不完整'});
    return;
  }

  if(url[0] == ""){
      url = [""];
  }

  if(!v.isLength(g_name,2,20)){
    res.send({code:2001,desc:'物品名称过长(短),2-20个字符'}); 
    return;
  }

  if(category == 0){
    res.send({code:2002,desc:'未选择分类'});
    return;
  }

  if(!v.matches(price,/^[0-9]+(.[0-9]{1,2})?$/)){
    res.send({code:2003,desc:'价格格式不对,仅填数字'});
    return;
  }

  if(!v.isLength(describe,4,150)){
    res.send({code:2004,desc:'介绍太长(短),4-150个字符'}); 
    return;
  }

  if(!v.isLength(name,1,5)){
    res.send({code:2005,desc:'称呼太长(短),最多5个字符'}); 
    return;
  }

  if(qq == '' && phone == ''){
    res.send({code:2006,desc:'联系方式必填一个'});
    return;
  }

  if(qq != ''){
    if(!v.matches(qq,/^[0-9]\d{4,10}$/)){
      res.send({code:2007,desc:'QQ号格式不对'});
      return;
    }
  }

  if(phone != ''){
    if(!v.matches(phone,/^1[3|4|5|8][0-9]\d{4,8}$/)){
      res.send({code:2008,desc:'手机号格式不对'});
      return;
    }
  }

  //校验token
  redis.getKey('user:'+user_id,function(err,val){
    if(err){
      res.send({code:0,desc:'服务器内部错误'});
      return;
    }

    if(val != token){
      res.send({code:3,desc:'token失效或非法，请重新登录'});
      return;
    }

    //校验5分钟key
    redis.getKey('time:user_'+user_id,function(err,time){
      if(err){
        res.send({code:0,desc:'服务器内部错误'});
        return;
      }

      if(time != null){
        res.send({code:2009,desc:'两条信息间隔不能少于5分钟'});
        return;
      }
 
      Goods.newAndSave(user_id, g_name, category, price, url, describe, date, name, addr, qq, phone, function(err){
        if(err){
          res.send({code:0,desc:'服务器内部错误'});
          return;
        }
        
        //首页列表count加1
        redis.incrValue('count:list_total',function(err){
          if(err){
            res.send({code:0,desc:'服务器内部错误'});
            return;
          }
          
          redis.incrValue('count:user_total_'+ user_id,function(err){
            if(err){
              res.send({code:0,desc:'服务器内部错误'});
              return;
            }
            //为该用户设置失效5分钟的key
            redis.setKeyTime('time:user_'+user_id,'0',config.redis.goods_time,function(err){
              if(err){
                res.send({code:0,desc:'服务器内部错误'});
                return;
              } 

              res.send({code:1,desc:'物品发布成功'});           
            });
          });
        });
      });
    });
  });   
}

//物品下架
exports.goodsDel = function(req, res) {
  var goods_id = req.body.goods_id;
  var token = req.body.token;
  var user_id = req.body.user_id;

  if(goods_id == null || token == null || user_id==null){
    res.send({code:2,desc:'信息不完整'});
    return;
  }

  redis.getKey("user:"+user_id,function(err,val){
    if(err){
      res.send({code:0,desc:'服务器内部错误'});
      return;
    }

    if(val!=token){
      res.send({code:3,desc:'token失效或非法，请重新登录'});
      return;
    }

    Goods.delGoodsById(user_id,goods_id,function(err){
      if(err){
        res.send({code:0,desc:'服务器内部错误'});
        return;
      }

      //首页列表count + 1
      redis.incrValue('count:list_total',function(err){
        if(err){
          res.send({code:0,desc:'服务器内部错误'});
          return;
        }   

        redis.incrValue('count:user_total_'+ user_id,function(err){
          if(err){
            res.send({code:0,desc:'服务器内部错误'});
            return;
          }

          res.send({code:1,desc:'物品删除成功'});        
        });
      });
    });
  });
}

//获取物品列表
exports.listGoods = function(req, res) {
  var page=req.body.page,
      cat=req.body.cat,
      addr=req.body.addr,
      size=10,
      status=1; 
     
  if(page==null || cat==null || addr==null){
    res.send({code:2,desc:'信息不完整'});
    return;
  }

  //获取首页列表count
  redis.getKey('count:list_total',function(err,val){
    if(err){
      res.send({code:0,desc:'服务器内部错误'});
      return;
    }
    
    //首页缓存key  
    var key = 'list:page_'+page+':addr_'+addr+':cat_'+cat+':count_'+val;    

    redis.getKey(key,function(err,goods){
      if(err){
        res.send({code:0,desc:'服务器内部错误'});
        return;
      }

      if(goods==null){
        Goods.findWhere(status,addr,cat,page,size,function(err,goods){ 
          if(err){
            res.send({code:0,desc:'服务器内部错误'});
            return;
          }
          //时间转换
          for(var i=0;i<goods.length;i++){
            goods[i].date=time.timeago(goods[i].date);
          }

          var val = JSON.stringify(goods);
          //设置添加首页缓存
          redis.setKeyTime(key, val, config.redis.list_time, function(err){
            if(err){              
              res.send({code:0,desc:'服务器内部错误'});
              return;
            }
            res.send({code:1,goods:goods});
          }); 
        });
      } else {
        var gds = JSON.parse(goods);
        res.send({code:1,goods:gds});
      }
    });
  });     
}

//单个物品
exports.showGoods = function(req, res) {
  var id =req.body.goods_id;
  var key = 'good:'+id;

  if(id==null || id==""){
    res.send({code:2,desc:'信息不完整'});
    return;
  }

  //获取单个物品缓存
  redis.getKey(key,function(err,goods){
    if(err){
      res.send({code:0,desc:'服务器内部错误'});
      return;
    }

      //缓存为空查询数据库
      if(goods==null){
        Goods.getGoodsById(id,function(err, goods){
          if(err){
            res.send({code:0,desc:'服务器内部错误'});
            return;
           }

            var val = JSON.stringify(goods);
            //设置添加单个物品缓存
            redis.setKeyTime(key, val, config.redis.list_time, function(err){
              if(err){              
                res.send({code:0,desc:'服务器内部错误'});
                return;
              }

              var list = {};
              list._id=id;
              list.describe=goods.describe;
              list.name=goods.name;
              list.qq=goods.qq;
              list.phone=goods.phone;
              res.send({code:1,goods:list});
            });
        });
      } else {
        var val={};
        var goods = JSON.parse(goods);
        val._id=goods._id;
        val.describe= goods.describe;
        val.name= goods.name;
        val.qq=goods.qq;
        val.phone=goods.phone;
        res.send({code:1,goods:val});
      }
  });
}

//个人中心 上架物品
exports.userHomeUp = function(req, res) {
  var token = req.body.token,
      user_id =req.body.user_id,
      page = req.body.page,
      size = 6,
      status = 1;

  if(page==null || token==null || user_id==null){
    res.send({code:2,desc:'信息不完整'});
    return;
  }

  redis.getKey("user:"+user_id,function(err,val){
    if(err){
      res.send({code:0,desc:'服务器内部错误'});
      return;
    }

    if(val!=token){
      res.send({code:3,desc:'token失效或非法，请重新登录'});
      return;
    }

    //获取个人中心列表count
    redis.getKey('count:user_total_'+ user_id,function(err,val){
      if(err){
        res.send({code:0,desc:'服务器内部错误'});
        return;
      }

      //个人中心缓存列表key
      var key = 'list:user_'+user_id+':count_'+':status_1'+val+':page_'+page; 
  
      redis.getKey(key,function(err,goods){
        if(err){
          res.send({code:0,desc:'服务器内部错误'});
          return;
        }

        if(goods==null){
          Goods.countGoodsById(user_id,status,page,size,function(err,goods){ 
            if(err){
              res.send({code:0,desc:'服务器内部错误'});
              return;
            }

            //时间转换
            for(var i=0;i<goods.length;i++){
              goods[i].date=time.timeago(goods[i].date);
            }

            var gds = JSON.stringify(goods);
            //设置个人中心列表缓存
            redis.setKeyTime(key, gds, config.redis.list_time, function(err){
              if(err){              
                res.send({code:0,desc:'服务器内部错误'});
                return;
              }

              res.send({code:1,goods:goods});
            });
          });
        } else {
          res.send({code:1,goods:JSON.parse(goods)});
        }
      });  
    });
  });
}

//个人中心 下架物品
exports.userHomeDown = function(req, res){
  var token = req.body.token,
      user_id =req.body.user_id,
      page = req.body.page,
      size = 6,
      status = 0;

  if(page==null || token==null || user_id==null){
    res.send({code:2,desc:'信息不完整'});
    return;
  }

  redis.getKey("user:"+user_id,function(err,val){
    if(err){
      res.send({code:0,desc:'服务器内部错误'});
      return;
    }

    if(val!=token){
      res.send({code:3,desc:'token失效或非法，请重新登录'});
      return;
    }

    //获取个人中心列表count
    redis.getKey('count:user_total_'+ user_id,function(err,val){
      if(err){
        res.send({code:0,desc:'服务器内部错误'});
        return;
      }

      //个人中心缓存列表key
      var key = 'list:user_'+user_id+':count_'+val+':status_0'+':page_'+page; 
  
      redis.getKey(key,function(err,goods){
        if(err){
          res.send({code:0,desc:'服务器内部错误'});
          return;
        }

        if(goods==null){
          Goods.countGoodsById(user_id,status,page,size,function(err,goods){ 
            if(err){
              res.send({code:0,desc:'服务器内部错误'});
              return;
            }

            //时间转换
            for(var i=0;i<goods.length;i++){
              goods[i].date=time.timeago(goods[i].date);
            }

            var gds = JSON.stringify(goods);
            //设置个人中心列表缓存
            redis.setKeyTime(key, gds, config.redis.list_time, function(err){
              if(err){              
                res.send({code:0,desc:'服务器内部错误'});
                return;
              }

              res.send({code:1,goods:goods});
            });
          });
        } else {
          res.send({code:1,goods:JSON.parse(goods)});
        }
      });  
    });
  });  
}

//个人中心单个物品
exports.showHomeGoods = function(req, res) {
  var id =req.body.goods_id;
  var key = 'good:'+id;

  if(id==null || id==""){
    res.send({code:2,desc:'信息不完整'});
    return;
  }

  redis.getKey(key,function(err,goods){
    if(err){
      res.send({code:0,desc:'服务器内部错误'});
      return;
    }

    if(goods==null){
      Goods.getGoodsById(id,function(err, goods){
        if(err){
          res.send({code:0,desc:'服务器内部错误'});
          return;
        }

        var val = JSON.stringify(goods);

        redis.setKeyTime(key, val, config.redis.list_time, function(err){
          if(err){              
            res.send({code:0,desc:'服务器内部错误'});
            return;
          }

          var list = {};
          list._id=goods._id;
          list.addr=goods.addr;
          list.name=goods.name;
          list.qq=goods.qq;
          list.phone=goods.phone;
          res.send({code:1,goods:list});
        }); 
      });
    } else {
      var val={};
      var goods = JSON.parse(goods)
      val._id=goods._id;
      val.addr= goods.addr;
      val.name= goods.name;
      val.qq=goods.qq;
      val.phone=goods.phone;
      res.send({code:1,goods:val});
    }
  });
}

//修改物品
exports.goodsEdit = function(req, res) {
  var token = req.body.token,
      goods_id = req.body.goods_id,
      user_id = req.body.user_id,
      price = req.body.price,
      name =req.body.name,
      qq = req.body.qq,
      phone = req.body.phone,
      addr =req.body.addr,
      describe =req.body.describe;

  if(token==null||goods_id==null||price==null||name==null||qq==null||phone==null||user_id==null){
    res.send({code:2,desc:'信息不完整'});
    return;
  }

  if(!v.matches(price,/^[0-9]+(.[0-9]{1,2})?$/)){
    res.send({code:2003,desc:'价格格式不对'});
    return;
  }

  if(!v.isLength(describe,4,150)){
    res.send({code:2004,desc:'介绍太长(短),4-150个字符'}); 
    return;
  }  

  if(!v.isLength(name,1,5)){
    res.send({code:2005,desc:'称呼太长(短)'}); 
    return;
  }

  if(qq == '' && phone == ''){
    res.send({code:2006,desc:'联系方式必填一个'});
    return;
  }

  if(qq != ''){
    if(!v.matches(qq,/^[1-9]\d{4,10}$/)){
      res.send({code:2007,desc:'QQ号格式不对'});
      return;
    }
  }

  //校验token获取user_id
  redis.getKey("user:"+user_id,function(err,val){
    if(err){
      res.send({code:0,desc:'服务器内部错误'});
      return;
    }

    if(val != token){
      res.send({code:3,desc:'token失效或非法，请重新登录'});
      return;
    }

    var goods = {};
    goods._id=goods_id;
    goods.price=price;
    goods.name=name;
    goods.qq = qq;
    goods.phone=phone;
    goods.addr=addr;
    goods.describe=describe;

    Goods.upGoodsById(user_id,goods_id,price,name,qq,phone,describe,function(err){
      if(err){
        res.send({code:0,desc:'服务器内部错误'});
        return;        
      }

      // 个人物品count加1
      redis.incrValue('count:user_total_'+ user_id,function(err){
        if(err){
          res.send({code:0,desc:'服务器内部错误'});
          return;
        }

        var value = JSON.stringify(goods);
        var key = 'good:'+ goods._id;

        //重置单个物品缓存
        redis.setKeyTime(key, value, config.redis.list_time, function(err){
          if(err){              
            res.send({code:0,desc:'服务器内部错误'});
            return;
          }

          res.send({code:1,desc:'物品信息修改成功，三分钟内生效'});          
        });
      });  
    });
  });
}

//物品举报 
exports.goodsReport = function(req, res){
  var goods_id = req.body.goods_id;
  var re_content = req.body.re_content;

  if(goods_id==null || re_content==null){
      res.send({code:2,desc:'信息不完整'});
      return;
  }

  if(!v.isLength(re_content,4,100)){
    res.send({code:2010,desc:'输入信息过长(短)'})
    return;
  }

  Goods.goodsReports(goods_id, re_content,function(err){
    if(err){
      res.send({code:0,desc:'服务器内部错误'});
      return;
    }

    res.send({code:1,desc:'谢谢你的举报,郑大街的明天会更好!'})
  });
}

//物品搜索
exports.findGoods = function(req, res){
  var condition = req.body.condition;
  var page = req.body.page;
  var addr=req.body.addr;
  var status = 1;
  var size = 6;


  Goods.search(condition, status, addr, page, size, function(err, goods){
    if(err){
      res.send(err);
    }
    res.send(goods);
  });
}