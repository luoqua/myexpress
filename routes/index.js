var express = require('express');
var router = express.Router();

var User = require('../models/User.js')

var path = require('path')

/*var xlsx = require('node-xlsx');*/

var fs = require('fs');

var Cs_site = require('../models/ConstructSite.js')


var formidable = require("formidable");



   

router.get('/getWeather',function(req,res){
	var https = require("https");  
	var iconv = require("iconv-lite");  
	var url="	https://free-api.heweather.com/s6/weather/forecast?location=CN101010100&key=2a8721d3909f43bf8ed3a4a6d91df0ca&lang=en&unit=i";  
	var res_json = res;
    https.get(url, function (res) {  
    	var resData = "";
    	res.on("data",function(data){
            resData += data;
        });
        res.on("end", function() {
            var result = JSON.parse(resData);
			res_json.json({ret_code: 0, ret_msg: result});
        });
    }).on("error", function (err) {  
        Logger.error(err.stack)  
        callback.apply(null);  
    });  
})



router.get('/handleCityExcel',function(req,res){
	var filename='./excel/china-city-list.xlsx';

	var obj = xlsx.parse(filename);	//配置excel的路径

	var i=0,j=0,k=0,prevI,prevJ,prevK,curI,curJ,curK;

	var result = obj[0].data;

	var city_result=[]

	result.forEach(function(item,index){
        if(index >= 2){
            curI = item[0].substr(item[0].length-2)
            
            curJ = item[0].substr(0,7)
            
            curK = item[0].substr(0,9)

            
            if( curJ !== prevJ && index !==2){
                i++;
                k=0
            }
            if( curI === '00'){
                var area = {
                    province:item[7],
                    city:item[2],
                    child:[]
                }
                if(!Array.isArray(city_result[i])){
                    city_result[i] = []
                }
                city_result[i].push(area)
            }else if( curI ==='01'){
                var area = {
                    province:item[7],
                    city:item[2],
                    child:[]
                }
                if(!Array.isArray(city_result[i])){
                    city_result[i] = []
                }
                city_result[i].push(area)

            }else{
                var area = {
                    city:item[9],
                    dis:item[2],
                }

                curK = curK.substr(curK.length-1)

                if(curK === '0') curK = 10
               	
                city_result[i][curK-1].child.push(area)
            }

            prevJ = item[0].substr(0,7)
            prevK = item[0].substr(0,9)

        }
    })

	var path_now = path.join(__dirname,"../public/china-city-list.js");

    

	var result_strings =  JSON.stringify(city_result)

	var content = `
		const lat_lng_arr = '${result_strings}';
	
		module.exports = lat_lng_arr;
		`
	fs.writeFile(path_now, content, (err) => {
	  if (err) throw err;
	  console.log('文件已保存！');
	});

	res.json({ret_code: 0, ret_msg: city_result});
})


router.get('/china_city_list',function(req,res) {
	
	var require_data = require("../public/china-city-list.js");

	require_data = JSON.parse(require_data);
	res.json({ret_code: 0, ret_msg:require_data});
})





router.post('/getData',function(req,res) {

	

	let address_result = [];
	let address
	var reg = /^[\u4e00-\u9fa5]+[a-z|A-Z]*[\u4e00-\u9fa5]+/g
	var result
	var construct_status = req.body.status;
	
	if( construct_status !== undefined){
		Cs_site.find({ construct_status: construct_status },{phone_number:0},function(err,comment) {
			
			comment.forEach(function(item,index){
				address = item.address;
				area = item.area;
				result = address.match(reg);

				address_result.push(
					{number:item.number,address:result[0],area:area})
			})
			res.json({ret_code: 0, ret_msg: address_result});
		});
	}else{
		res.json({ret_code: 1, ret_msg: "请传工地类别status"});
	}
})


router.post('/saveData',function(req,res) {
	
	var lat_lng_arr = JSON.parse(req.body.lat_lng_arr)
	
	var status = JSON.parse(req.body.status)
	if(status === 1){
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


router.get('/export_data_site_now',function(req,res) {
	
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

router.get('/export_data_site',function(req,res) {
	
    var LnglatNow = require('../models/Lnglatdata.js')
    LnglatNow.find({},function(err, docs) {
    	
    	var path_now = path.join(__dirname,"../public/data_site_lat.js");

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
})


router.post('/get_site_data_lat',function(req,res) {
	
	var require_data = require("../public/data_site_lat.js");

	require_data = JSON.parse(require_data);
	res.json({ret_code: 0, ret_msg:require_data});
})

router.post('/get_site_now_lat',function(req,res) {
	
	var require_data = require("../public/data_site_now_lat.js");

	require_data = JSON.parse(require_data);
	res.json({ret_code: 0, ret_msg:require_data});
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
