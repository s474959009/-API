

var Reports = require('../models/reports');
var Goods=require('../models/goods');


//发布物品
exports.newAndSave = function(user_id, g_name, category, price, url, describe, date, name, addr, qq, phone, callback){
	var goods = new Goods();
	goods.user_id = user_id;
	goods.g_name = g_name;
	goods.category = category;
	goods.price = price;
	goods.url = url;
	goods.describe = describe;
	goods.date = date;
	goods.name = name;
	goods.addr = addr
	goods.qq = qq;
	goods.phone = phone;
	goods.save(callback);
};

exports.getGoodsById = function(id, callback){
	Goods.findById(id,'name qq phone describe price addr').exec(callback);
};


//返回符合文档数（cat）
exports.countWhere = function(status,cat,callback){
	var op={};

	if(status!=null){
		op.status=status;
	}

	if(cat!=null&&cat!=0){
		op.category=cat;
	}

	Goods.count(op,callback);
}

//查询文档总数（id）
exports.countIdWhere = function(status,id,callback){
	var op={};

	if(status!=null){
		op.status=status;
	}

	if(id!=null){
		op.user_id=id;
	}

	Goods.count(op,callback);
}

//查找物品并分割（查状态 分类）
exports.findWhere = function(status,addr,cat,page,size,callback){
	var op={};

	if(status!=null){
		op.status=status;
	}

	if(cat!=null&&cat!=0){
		op.category=cat;
	}

	if(addr!=null&&addr!=0){
		op.addr=addr;
	}	


	Goods.find(op,'_id g_name price addr date url').sort('_id','descending').skip((page)*size).limit(size).exec(callback);
}

//查找物品并分割（查ID）
exports.countGoodsById = function(id,status,page,size,callback){
	var op={};

	if(status!=null){
		op.status=status;
	}

	if(id!=null){
		op.user_id=id;
	}

	Goods.find(op,'_id g_name price date url').sort('_id','descending').skip((page)*size).limit(size).exec(callback);
}


//删除物品（status为0）
exports.delGoodsById = function(user_id,goods_id,callback){
	var condition={_id:goods_id,user_id:user_id};
	var update={status:0};
	var option = {upsert : true};
	Goods.update(condition,update,option).exec(callback);
};

//修改物品
exports.upGoodsById = function(user_id,goods_id,price,name,qq,phone,describe,callback){
	var condition={};
	condition.user_id=user_id;
	condition._id=goods_id;

	var update={};
	update.price=price;
	update.name=name;
	update.qq=qq;
	update.phone=phone;
	update.describe=describe;
	
	var option = {upsert : true};
	
	Goods.update(condition,update,option).exec(callback);
}

//物品举报
exports.goodsReports = function(goods_id,re_content,callback){
	var reports = new Reports()
	reports.goods_id = goods_id;
	reports.re_content = re_content;

	reports.save(callback)
}

//物品名称搜索
exports.search = function(condition, status, addr, page, size, callback){
	var reg_condition = new RegExp(condition);

	var op={};

	if(status!=null){
		op.status=status;
	}

	if(addr!=null&&addr!=0){
		op.addr=addr;
	}	

	if(condition!=null){
		op.g_name = reg_condition;
	}

	Goods.find(op,'_id g_name addr price date url describe').sort('_id','descending').skip((page)*size).limit(size).exec(callback);
}