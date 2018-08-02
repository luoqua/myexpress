var mongoose = require("mongoose");
var Schema = mongoose.Schema;


//创建Schema
var LnglatdataNowSchema = new Schema({
	lng:String,
	lat:String,
	number:{type:[String],unique:true},
	address:String,
	area:Number
})

module.exports = LnglatdataNowSchema