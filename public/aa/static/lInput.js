(function(root,factory) {

	if (typeof define === 'function' && define.amd) {
		// 使用requier.js的情况，AMD模块api 存在
		define('ajax',factory)
	} else if ( typeof exports === 'object') {
		// 使用sea.js的情况
		exports = module.exports = factory()
	} else {
		// @deprecated
		// 这时传入的 root = window
		// 绑定到全局变量window上
		root.LInput = factory()
		root.LInput = factory()
	}

})(window,function() {
	function LInput(options) {
		this.configure = {
			parent: '',
			selectType: 'id', // 支持class、name 的选择
			btn: '#btn',
			needfields: [
				{
					fieldName: 'QQ',
					isRequired: true,
					Regxp: '^1(3|4|5|7|8)\\d{9}$',
					err_null_msg: '请填写您的号码',
					err_rxp_msg: '请填写正确的手机号码'
				},
				{
					fieldName: 'Contact',
					isRequired: false,
					Regxp: '',
					err_null_msg: '请填写您的装修地址',
					err_rxp_msg: '请填写正确的装修地址'
				},
				{
					fieldName: 'GuestName',
					isRequired: false,
					Regxp: '',
					err_null_msg: '请填写您的姓名',
					err_rxp_msg: '请填写正确的姓名'
				},
				{
					fieldName: 'Gender',
					isRequired: false,
					Regxp: '',
					err_null_msg: '请填写您的装修面积',
					err_rxp_msg: '请填写正确的装修面积'
				},
				{
					fieldName: 'Email',
					isRequired: false,
					Regxp: '',
					err_null_msg: '请完整的选择您的户型',
					err_rxp_msg: '请填写正确的户型'
				},
				{
					fieldName: 'messageTitle',
					isRequired: false,
					Regxp: '',
					err_null_msg: '请完整的选择您的户型',
					err_rxp_msg: '请填写正确的户型'
				},
				{
					fieldName: 'messageContent',
					isRequired: false,
					Regxp: '',
					err_null_msg: '请完整的选择您的户型',
					err_rxp_msg: '请填写正确的户型'
				},
				{
					fieldName: 'Address',
					isRequired: false,
					Regxp: '',
					err_null_msg: '请完整的选择您的户型',
					err_rxp_msg: '请填写正确的户型'
				},
				{
					fieldName: 'f5',
					isRequired: false,
					Regxp: '',
					err_null_msg: '请完整的选择您的户型',
					err_rxp_msg: '请填写正确的户型'
				}
			],
			formfields: {
				Contact: '.user_district',
				QQ: '.user_phone',
				GuestName: '.user_name',
				Gender: '.user_area',
				Email: '.email',
				MessageTitle: '.messageTitle',
				MessageContent: '.messageContent',
				Address: '.address',
				f5: '.f5',
				hd_flag: '.hd_flag'
			},
			hostApi: 'channel/guestbookadd/l/cn',
			layerFunc: ''
		}
		this.configure.inputParam = []
		// 检验所传配置信息是否符合规范
		this.options = options

		Object.assign(this.configure,options || {})

		this.checkOptions(options)
		this.addEvent()
	}

	// 检验options 是否符合规范
	LInput.prototype.checkOptions = function(options) {
		// 必须要配置的属性
		var requierdParm = ['parent','selectType','btn','formfields']
		var that = this

		if (!options) {
			this.error('请先传入参数')
			return false
		}
		Object.keys(options).forEach(function(key) {
			if (requierdParm.indexOf(key) > -1 && !options[key]) {
				that.error(` 需要配置${key}`)
			}
		})

	}

	// 给btn添加点击事件
	LInput.prototype.addEvent = function() {
		var that = this
		var Obtn = document.getElementById(this.configure.btn)

		if (Obtn === null) {
			this.error('请指定提交按钮')
			return
		}
		Obtn.addEventListener('click',function() {
			that.selectfields()
		})
	}

	LInput.prototype.handleErr = function(msg) {
		this.callHook('layerFunc',msg)
	}

	// 初始化
	LInput.prototype.init = function() {
		this.callHook('beforeInit')
	}

	// 根据formfields对应字段关系，获取对应input的值
	LInput.prototype.selectfields = function() {
		var formAction
		var selectDom = {}
		var formfields = this.configure.formfields
		var needfields = this.configure.needfields
		var queryValue
		var that = this
		var promise
		var selectItem
		var testFlag = true

		formAction = document.getElementById(this.configure.parent)
		if (this.configure.parent === '' || formAction === null) {
			this.error('please config the parent id or cannot select parent id')
			return false
		}

		// 处理选择到的字段，并进行字段验证
		needfields.every(function(item) {
			selectItem = formAction.querySelector(formfields[item.fieldName])
			if (selectItem === null) {
				return true
			}
			if (item.isRequired && (formfields[item.fieldName] === null || formfields[item.fieldName] === undefined)) {
				that.error(` ${item.fieldName}是必须字段`)
			}
			queryValue = selectItem && selectItem.value

			if (selectItem !== null && !queryValue) {
				that.handleErr(item.err_null_msg)
				testFlag = false
				return false
			}

			if (!new RegExp(item.Regxp).test(queryValue)) {
				that.handleErr(item.err_rxp_msg)
				testFlag = false
				return false
			}

			selectDom[item.fieldName] = selectItem.value

			return true
		})

		if (testFlag === false) {
			return false
		}
		promise = this.formsubimit(selectDom)
		// 数据提交前
		this.callHook('beforeSubmit')
		promise.then(function() {
			// 数据提交后
			that.callHook('finishSubmit')
		})

	}

	// 设置所需字段，默认有，可以重新配置
	LInput.prototype.setneedfields = function() {}

	// 表单提交
	LInput.prototype.formsubimit = function(selectDom) {
		var formData = new FormData()
		var hostApi = this.configure.hostApi
		var options

		Object.keys(selectDom).forEach(function(key) {
			formData.append(key, selectDom[key])
		})


		const defer = new Promise((resolve, reject) => {
			fetch(hostApi,options)
				.then((response) => response.json())
				.then((data) => {
					if (data.status === 1) {
						resolve(data.data)	// 返回成功数据
					} else {
						reject(data) // 返回失败数据
					}
				})
				.catch((error) => {
				// 捕获异常
					reject(error)
				})
		})

		return defer
	}

	// 处理错误
	LInput.prototype.error = function(message) {
		console.error(message)
	}


	// 执行生命周期钩子函数
	LInput.prototype.callHook = function(hook,parm) {
		// 支持传入第三方插件函数,如layer
		var handler = this.configure[hook]
		var parmfunc = parm || {}


		if (typeof handler === 'function' && handler) {
			try {
				handler.call(this,parmfunc)
			} catch (e) {
				console.error('hook')
			}
		} else {
			this.error('hook must be a function')
		}
	}
	return LInput

})