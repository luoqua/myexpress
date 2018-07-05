
//用来连接mongoDB数据库并引用定义的Schema和Model
const mongoose = require('mongoose');
const config = require('./config');

module.exports = ()=>{

	mongoose.connect(config.mongodb);//连接mongodb数据库

	var db = mongoose.connection;
	db.on('error',(err) => {
		console.log(err)
	})
	db.once('open',(callback) => {
		console.log('MongoDB连接成功！！');
	})
	return db;
}
