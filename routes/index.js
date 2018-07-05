var express = require('express');
var router = express.Router();

var User = require('../models/User.js')

var path = require('path')

var xlsx = require('node-xlsx');

var fs = require('fs');

var Cs_site = require('../models/ConstructSite.js')



router.get('/handleExcel',function(req,res){

	var filename='./excel/test.xlsx';

	var obj = xlsx.parse(filename);	//配置excel的路径

	//var excelObj=obj[0].data;//excelObj是excel文件里第一个sheet文档的数据，obj[i].data表示excel文件第i+1个sheet文档的全部内容

	var object_filed = [
	    		"number",
	    		"address",
	    		"yz_name",
	    		"phone_number",
	    		"area",
	    		"area_range",
	    		"project_time",
	    		"district",
	    		"contract_cost",
	    		"designer",
	    		"engineering_supervision",
	    		"project_date",
	    		"expected_date",
	    		"project_finsh_date"
	    	]
	var result = []
	var construct_progress = ["一部在建","二部在建","三部在建","四部在建"];
        
    var construct_complete = ["一部完工","二部完工","三部完工","四部完工"];

    var result_dd;
	for( var i =0;i< obj.length;i++){

		let construct_name = obj[i].name;

		let construct_status = construct_progress.indexOf(construct_name) > -1 
								? 0 
								: ( construct_complete.indexOf(construct_name) > -1 
									? 1
									: -1
									)
		
		if( construct_status !== -1 ){

			let excelObj = obj[i].data;

			excelObj.forEach(function(item,index){
				if( index > 1 && item.length > 1){
					let [ 
			    		,
			    		number,
			    		address,
			    		yz_name,
			    		phone_number,
			    		area,
			    		area_range,
			    		project_time,
			    		district,
			    		contract_cost,
			    		designer,
			    		engineering_supervision,
			    		project_date,
			    		expected_date,
			    		project_finsh_date
		    		]= item;
		    		var result_ob = {}
		    		object_filed.forEach(function(item) {
			    		result_ob[item] = eval(item)
			    	})

			    	result_ob['construct_status'] = construct_status;
			    	
			    	result.push(result_ob)
				}
			})
		}
	}

	Cs_site.insertMany(result, function(err, docs){
	        if(err) console.log(err);
	        console.log('保存成功：' + docs);
	});

	res.json({ret_code: 0, ret_msg: result});


})


router.get('/getData',function(req,res) {


	let address_result = [];
	let address
	var reg = /^[\u4e00-\u9fa5]+[a-z|A-Z]*[\u4e00-\u9fa5]+/g
	var result
	var construct_status = req.query.status;
	
	if( construct_status !== undefined){
		Cs_site.find({ construct_status: construct_status },{phone_number:0},function(err,comment) {
			
			comment.forEach(function(item,index){
				address = item.address;

				result = address.match(reg);

				address_result.push(
					{number:item.number,address:result[0]})
			})

			res.json({ret_code: 0, ret_msg: address_result});
		}).limit(10);
	}else{
		res.json({ret_code: 1, ret_msg: "请传工地类别status"});
	}
})


router.post('/saveData',function(req,res) {
	
	var lat_lng_arr = JSON.parse(req.body.lat_lng_arr)
	
	if(req.body.status === 1){
		var Lnglat = require('../models/Lnglatdata.js')
		Lnglat.insertMany(lat_lng_arr,function(err, docs) {
			if(err) console.log(err);
		    console.log('保存成功：' + docs);
		})
		
		res.json({ret_code: 0, ret_msg:lat_lng_arr});
	}else{
		var LnglatNow = require('../models/LnglatdataNow.js')
		LnglatNow.insertMany(lat_lng_arr,function(err, docs) {
			if(err) console.log(err);
		    console.log('保存成功：' + docs);
		})

		res.json({ret_code: 0, ret_msg:lat_lng_arr});	
	}
})


router.get('/export_data_site',function(req,res) {

    var LnglatNow = require('../models/LnglatdataNow.js')
    LnglatNow.find({},function(err, docs) {
    	
    	var path_now = path.join(__dirname,"../public/data_site_now_lat.js");

    	docs = docs.filter(function(item,index) {
    		return item.lnt !== null && item.lng !== null;
    	})

    	var result_strings =  JSON.stringify(docs)

    	var content = `
			const lat_lng_arr = '${result_strings}';
		
			module.exports = lat_lng_arr;
			`
		fs.writeFile(path_now, content, (err) => {
		  if (err) throw err;
		  console.log('文件已保存！');
		});
		
		
    }).sort({ lat:1 });

    LnglatNow.find({},function(err, docs) {
    	
    	var path_now = path.join(__dirname,"../public/data_site_now_lng.js");

    	docs = docs.filter(function(item,index) {
    		return item.lnt !== null && item.lng !== null;
    	})

    	var result_strings =  JSON.stringify(docs)

    	var content = `
			const lat_lng_arr = '${result_strings}';
		
			module.exports = lat_lng_arr;
			`
		fs.writeFile(path_now, content, (err) => {
		  if (err) throw err;
		  console.log('文件已保存！');
		});
		
		
    }).sort({ lng:1 });
})


router.post('get_site_data',function(req,res) {
	
})


/* GET home page. */
router.get('/',function(req,res) {
	var user = new User({
		username:'admin',
		password:'123'
	})

	user.save((err)=>{
		console.log('save status',err ? 'failed':'success');
	})
	res.send('Hello World!aaaaadasdaasd');
});





router.get('/submit',(req,res,next) => {

	/*var user = new User({
		username:'admin',
		password:'123'
	})

	user.save((err)=>{
		console.log('save status',err ? 'failed':'success');
	})*/
	
/*	User.find({		//查找
		username:'admin',
		password:'123'
	},(err,docs) =>{
		if(err){
			res.send('server or db error');
		}else{
			console.log('登录成功用户：'+docs);
			if(docs.length ==0 ){
				res.send('用户名或密码有误');
			}else{
				req.session.user = {
					_id:docs[0]._id,
					username:docs[0].username
				}
				req.send('login success');
			}
		}
	})*/

	User.findOne({	//查找一条
		username:'admin',
		password:'123',
	},(err,doc) => {
		if(err){
			res.send('server or db error');
		}else{
			console.log('登录成功 用户：' + doc);
			if(doc ==null){
				res.send('用户名或密码有误');
			}else{
				req.session.user = {
					_id:doc._id,
					username:doc.username
				};
				res.json({ret_code: 0, ret_msg: '登录成功'});
			}
		}
	})
})



module.exports = router;
