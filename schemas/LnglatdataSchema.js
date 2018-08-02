var mongoose = require("mongoose");
var Schema = mongoose.Schema;


//创建Schema
var LnglatdataSchema = new Schema({
	lng:String,
	lat:String,
	number:{type:[String],unique:true},
	address:String,
	area:Number
})

module.exports = LnglatdataSchema