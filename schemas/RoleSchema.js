var mongoose = requie("mongoose");
var Schema = mongoose.Schema;

//创建Schema
var userSchema = new Schema({
	username:String,
	password:String
})

module.exports = userSchema;