var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;

var goodsSchema = new Schema({
    user_id: String,
    g_name: String,         //物品名称
    price: Number,        //物品价格
    url: Array,          //图片路径
    category: String,     //物品分类
    describe: String,     //物品描述
    date: String,          //发布日期
    qq: String,	  //QQ	
	phone: String,//手机
	addr: {type: String},                     	//校区    	
	name: {type: String},                     	//联系人称呼
    status: {type:Number, default:1}         //物品状态
},{collection:'goods'});

var Goods=mongoose.model('goods',goodsSchema);

module.exports=Goods;
