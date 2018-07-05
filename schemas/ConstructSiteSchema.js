var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//创建Schema
var ConstructSiteSchema = new Schema({
	number:{type: [String], unique: true},
	address:String,
	yz_name:String,
	phone_number:{type: [String]},
	area:String,
	area_range:String,
	project_time:String,
	district:String,
	contract_cost:String,
	designer:String,
	engineering_supervision:String,
	project_date:String,
	expected_date:String,
	project_finsh_date:String,
	construct_status:Number
})

module.exports = ConstructSiteSchema;