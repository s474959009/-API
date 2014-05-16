
var moment=require('moment');

 exports.timeago=function(obj){
  moment.lang('zh-cn');
  return moment.unix(obj).fromNow();
 }
