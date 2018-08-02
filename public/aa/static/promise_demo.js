(function(root,factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory)
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory()
		exports = factory()
	} else {
		root.Promise = factory()
	}
})(window,function() {

	
	var Status = {
		PENDING:'pending',
		FULLFILLED:'resolved',
		REJECTED:'rejected'
	}

	//定义一个空函数，用于生成一个Promise对象
	function empty() {}

	/**
	 * 
	 * @param {Function} executor是带有resovle和reject两个参数的函数。Promise构造函数执行
	 * 时立即调用executor,resolve和reject两个函数作为参数传递给executor
	 * (executor函数在Promise构造函数返回新建对象前被调用)。resolve和reject函数被调用时，分别将
	 * promise的状态改为fulfilled(完成)或rejected(失败)。executor内部通常会执行一些异步操作，
	 * 一旦完成，可以调用resolve函数来讲promise状态改成fulfilled，或者在发生错误时将它的
	 * 状态改为rejectd
	 *
	 * 如果在executor函数中抛出一个错误，那么该promise状态为rejected.executor的返回值被忽略
	 *
	 * 说明：Promise对象是一个代理对象(代理一个值)，被代理的值在Promise对象创建时可能是未知的。
	 * 它允许你为异步操作的成功和失败分别绑定相应的处理方法(handlers)。这让异步方法可以像同步
	 * 方法那样返回值，但并不是立即返回最终执行结果，而是一个能代表未来出现的结果的Promise对象。
	 *
	 * Promise的成功和失败状态被触发时，Promise对象的then方法绑定的处理方法就会被调用
	 * (then方法包含两个参数:onfulfilled和onrejected,它们都是Function类型。当Promise状态为fulfilled时，
	 * 调用then的onfulfilled方法,当Promise状态为rejected时，调用then的onrejected)
	 */
	function Promise(resolver) {

/*		var _value;

		var promise = this;

		this._status= Status.PENDING

		this._value = _value;

		this._fulfillStack = [];

		this._rejectedStack = [];

		if( typeof executor === 'function'){

			function aa(){
				return function(){
					executor(
					function(value) {
						Promise.resolve(promise,value)
					},
					function(value) {
						Promise.reject(promise,value)
					})
				}
			}

			this._fulfillStack.push(aa())
			next(promise)
		}

		return this*/

		if (!(this instanceof Promise)) {
			throw new TypeError("TypeError: undefined is not a promise")
		}

		if (!(typeof resolver === "function")) {
			throw new TypeError("TypeError: Promise resolver undefined is not a function")
		}

		this._status = Status.PENDING;

		this._value

		this._fulfilledStack = []

		this._rejectedStack = []

		var promise = this

		//捕获resolver中的错误
		try{
			resolver(
				function(value){
					resolve(promise,value)
				},
				function(reason){
					reject(promise,reason)
				}
			)
		}
		catch(reason){
			//如果是非解决状态，捕获抛出的错误
			if(promise._status === Status.PENDING){
				reject(promise,reason)
			}
		}

	}

					
	/**
	 * 该方法返回一个带有拒绝原因reason的参数的Promise对象
	 * @param   reason 表示Promise是被拒绝的
	 * @return {Promise} 一个给定原因了的被拒绝的Promise.
	 *
	 * 说明:静态函数Promise.reject返回一个被拒绝的Promise对象，
	 */
	Promise.reject = function(reason){

		var promise = new Promise(empty)
	
		promise._status = Status.REJECTED;
		promise._value = reason

		return promise


	}


	/**
	 * 该方法返回一个以给定值解析后的Promise对象。但如果这个值是
	 * thenable(即带有then方法)，返回的Promise会"跟随"这个thenable的对象。
	 * 采用它的最终状态(指resolved/rejected/pending/settled);如果传入的
	 * value本身就是promise对象，则该对象作为Promise.resolve方法的返回值返回
	 * 否则以该值为成功状态返回promise对象
	 *
	 * var promise1 = Promise.resolve([1,2,3]);
	 *
	 * promise1.then(function(value) {
	 * 		console.log(value);
	 * 		//expected output:Array[1,2,3]
	 * })
	 *
	 * 语法：
	 * 1、Promise.resolve(value)
	 * 2、Promise.resolve(promise)
	 * 3、Promise.resolve(thenable)
	 * 
	 * @param  {<value|Promise|thenable>} value 将被Promise对象解析的参数。既可以是一个Promise对象，也可以是一个thenable
	 * @return {Promise}   返回一个解析过带着给定值的Promise对象，如果返回值是一个promise对象，
	 * 则直接返回这个Promise对象
	 *
	 * 说明：
	 * 静态方法Promise.resolve返回一个解析过的Promise对象
	 */
	Promise.resolve = function(value){


		if(value instanceof Promise) {
			return value

		}else if(typeof value === 'object' && typeof value.then === 'function'){

			var then = value.then;
			return new Promise(then)

		}else{

			var promise = new Promise(empty)
			promise._status = Status.FULLFILLED
			promise._value = value

			return promise

		}
	}
	

	//用于处理resolve的`then`回调
	function resolve(promise,value,flag){

		if( promise._status === Status.FULLFILLED){
			return false;
		}
		promise._status = Status.FULLFILLED
		promise._value = value

		setTimeoutPromise(promise,flag)
	}


	function setTimeoutPromise(promise,flag){
		
		if( promise._status === Status.PENDING){
			return false;
		}

		setTimeout(function(){
			var stack;

			stack = promise._status === Status.FULLFILLED ? promise._fulfilledStack : promise._rejectedStack;
			
			if( promise._status === Status.REJECTED && stack.length === 0){
				stack = promise._fulfilledStack;
			}

			if( promise._status === Status.REJECTED && promise._fulfilledStack.length >= 2){
				let [,...other_stack] = promise._fulfilledStack;
				Array.prototype.push.apply(stack,other_stack)
			}
			var value = promise._value;
			function next(stack){		
				
				if( !!!stack[0]  ){
					return false
				}
				var stack2 = [];
				for( var i = 0,len = stack.length;i<len;i++){
					stack2[i] = stack[i](value)
				}

				stack2 = stack2.filter(function(item){
					return item !== undefined && item !== false
				})

				next(stack2)
			}
			

			next(stack)

			promise._fulfilledStack = [];
			promise._rejectedStack = [];
		})

/*		setTimeout(function(){
			var len = stack.length;

			for( var i = 0; i < len;i++ ){
				var fn = stack[i];
				promise._fulfilledStack.splice(i,1)
				if ( typeof fn === "function") {
						
						var result = fn(value)

						if (result instanceof Promise) {
							result.then(function(value){
								resolve(promise,value)
							})
							break;
						} else if( result !== undefined) {
							resolve(promise,result)
						} 
				}

			}

		})*/

	}
	//用于处理reject的`then`回调
	function reject(promise,reason){

		if( promise._status === Status.REJECTED){
			return false;
		}
		promise._status = Status.REJECTED
		promise._value = reason

		//使用setTimeout去模拟异步
		setTimeoutPromise(promise)
	}


	/**
	 * 该方法返回一个Promise实例，此实例在iterable参数内所有的promise
	 * 都完成(resolved)或参数中不包含promise时回调完成(resolve);
	 * 如果参数中promise有一个失败(rejected),此时离回调失败(reject)
	 * 失败的原因是一个失败的promise的结果
	 *
	 * //examples
	 * var promise1 = Promise.resolve(3);
	 * var promise2 = 42
	 * var promise3 = new Promise(function(resolve,reject) {
	 * 		setTimeout(resolve,100,'foo')
	 * })
	 * Promise.all([promise1,promise2,promise3]).then(function(values){
	 * 		console.log(values);
	 * })
	 * //expected output:Array [3,42,"foo"]
	 *
	 * 
	 * @param  {<Array|string>} iterable 一个可迭达对象，如Array或String
	 * @return 
	 * 1、如果传入的参数一个空的可迭达对象，则返回一个已完成状态的Promise
	 * 2、如果传入的参数不包含任何promise，则返回一个异步完成的Promise
	 * 3、其他情况下返回一个处理中(pending)的Promise。这个返回的promise之后会
	 * 在所有的promise都完成或有一个promise失败时异步地变为完成或失败
	 *
	 * 完成
	 * 返回值将会按照参数的内的promise顺序排列，而不是由调用promise的完成顺序决定
	 * 任何情况下，Promise.all 返回的promise的完成状态的结果都是一个数组，它包含
	 * 所有的传入迭达参数对象的值(也包括非promise值)
	 *
	 * 失败
	 * 如果传入的 promise中又一个失败(rejected)，Promise.all 异步地将失败的那个结果传给
	 * 失败状态的函数，而不管其他promise是否完成。
	 */
	Promise.all = function(iterable){

		if (!iterable || !iterable.hasOwnProperty('length')) {
			throw new TypeError('TypeError: Parameter `iterable` must be a iterable object');
		}

		if(iterable.length === 0){
			var promise = Promise.resolve(iterable);
			return promise

		}else{

			var promise_result = [];


			var promise = new Promise(function(resolve,reject) {
				
				handlePromiseAll(iterable,promise_result,resolve,reject)

			})
		
		}	

		return promise
	}

	/**
	 * 处理Promise.all的resolve
	 * @param  {[type]} i              [description]
	 * @param  {[type]} len            [description]
	 * @param  {[type]} resolve        [description]
	 * @param  {[type]} promise_result [description]
	 * @return {[type]}                [description]
	 */
	function handlePromiseAll(iterable,promise_result,resolve,reject) {

		var len = iterable.length;

		for( var i = 0; i < len;i++){

			var fnc = iterable[i];

			if( fnc instanceof Promise && fnc._status === Status.PENDING){
				(function(i){
					fnc.then(
						function(value) {
							promise_result.push(value)
							if( i===len - 1){
								allResolve(i,len,resolve,promise_result)
							}
						},
						function(reson){
							reject(reson)
							return false;
						}
					)
				})(i)
			}else if(fnc instanceof Promise && fnc._status === Status.FULLFILLED){
				promise_result.push(fnc._value)
				allResolve(i,len,resolve,promise_result)

			}else if(fnc instanceof Promise && fnc._status === Status.REJECTED){
				setTimeout(function(){
					reject(fnc._value)
				})
				return false;

			}else{
				promise_result.push(fnc)
				allResolve(i,len,resolve,promise_result)
			}
		}
	}


	function allResolve(i,len,resolve,promise_result){
		if( i===len - 1){
			setTimeout(function(){
				resolve(promise_result);
			})
			return false;
		}
	}
	
	/** 
	  * 该方法回一个promise，一旦迭代器中的某个promise解决或拒绝，
		* 返回的promise就好解决或拒绝
		* 示例
		* 
		* var promise1 = new Promise(function(resolve,reject)){
		* 		setTimeout(resolve,500,'one')
		* }
		* 
		* var promise2 = new Promise(function(resolve,reject)) {
		* 		setTimeout(resolve,100,'two')
		* }
		* 
		* Promise.race([promise1, promise2]).then(function(value) {
	  *		console.log(value);
	  * 		Both resolve, but promise2 is faster
		* });
		* expected output: "two"
		*
	  * @param  {<Array|string>} iterable 一个可迭达对象，如Array或String
	  * @return {Promise} 一个待定的Promise，只要给定的迭达中的一个Promise
	  * 解决或拒绝，就采用第一个promise的值作为它的值，从而异步地解析
	  * 或拒绝(一旦堆栈为空)
	  *
	  * 说明：race函数返回一个Promise，它将于第一个传递的promise相同的完成
	  * 方式被完成。它可以是完成(resolves)，也可以是失败(rejects)
	  * 这要取决于第一个完成的方式是两个中的哪一个
	  * 如果传的迭代是空的，则返回的promise将永远等待。
	  *
	  * 如果迭达包含一个或多个非承诺值或已解决或已拒绝的承诺，则Promise.race
	  * 将解析为迭达中找到的第一个值
	  */
	Promise.race = function(iterable){

		if (!iterable || !iterable.hasOwnProperty('length')) {
			throw new TypeError('TypeError: Parameter `iterable` must be a iterable object');
		}



		var promise_result = [];


		var promise = new Promise(function(resolve,reject) {
			
			handlePromiseRace(iterable,promise_result,resolve,reject)

		})
		
		return promise

	}


	function handlePromiseRace(iterable,promise_result,resolve,reject){
		var len = iterable.length;
		
		var endFlag = false;                 // 使用endFlag 跳出循环
		for( var i = 0; i < len;i++){

			var fnc = iterable[i];

			if( endFlag ){
				break;
			}
			if( fnc instanceof Promise && fnc._status === Status.PENDING){
				(function(i){
					fnc.then(
						function(value) {
							raceResolve(resolve,value)
						},
						function(reason){
							setTimeout(function(){
								reject(fnc._value)
							})
							endFlag = true;
						}
					)
				})(i)
			}else if(fnc instanceof Promise && fnc._status === Status.FULLFILLED){
				
				raceResolve(resolve,fnc._value)

			}else if(fnc instanceof Promise && fnc._status === Status.REJECTED){
				setTimeout(function(){
					reject(fnc._value)
				})
				endFlag = true;
			}else{
				raceResolve(resolve,fnc._value)
			}
		}
	}

	function raceResolve(resolve,value){
		setTimeout(function(){
			resolve(value);
		})
		endFlag = true;
	}





	Promise.prototype = {
		// 返回被创建的实例函数.  默认为 Promise 函数.
		constructor:Promise,

		/**
		 * catach() 方法返回一个Promise，并且处理拒绝的情况。它的行为与调用
		 * Promise.prototype.then(undefined,onRejected)相同。
		 * @param  {onRejected} 当Promise被rejected时，被调用的一个Function.该函数拥有一个参数:
		 * reason(rejection)的原因
		 * 如果onRejected抛出一个错误或返回一个本身失败的Promise,通过catch（）返回的Promise被rejected;
		 * 否则，它将显示为成功(resolved)
		 * @return {Promise}  返回一个Promise
		 */
		catch:function(onRejected){

			// catch只执行rejected状态下以及pending状态的回调
			if( this._status !== Status.FULLFILLED ){
				return this.then(undefined,onRejected);
			}else {
				return this;
			}
		},

		/**
		 * then()方法返回一个Promise.它最多需要有两个参数:Promise的成功和失败的情况的回调函数
		 * @param  {Function} onFulfilled 当Promise变成接受状态(fulfillment)时，该参数作为回调函数
		 * 被调用。该函数有一个参数，即接受的值(the fulfillment value)
		 * @param  {Function} onRejected  当Promise变成拒绝状态(rejection)时，该参数作为回调函数被
		 * 调用。该函数有一个参数，即拒绝的原因(the rejection reason)
		 * @return {Promise}   then 方法 返回一个Promise。它的行为与then中的回调函数的返回值有关
		 */
		then:function(onFulfilled, onRejected){
			
			var promise = new Promise(empty)

			var that = this;
			if (typeof onFulfilled === 'function') {

				this._fulfilledStack.push(makeFulfilledfunc(onFulfilled,promise,that))

			}

			if (typeof onRejected === 'function') {
				this._rejectedStack.push(makeRejectedfunc(onRejected,promise,that))
			}

			/*var that = this;
			setTimeout(function(){

				if( that._status === Status.REJECTED && onFulfilled !== undefined && onRejected === undefined){
					promise._status = Status.REJECTED;
					promise._value = that._value;
				}
			})*/
			
			setTimeoutPromise(this)
			
			//处理特殊情况
			/*var p5 = new Promise((resolve, reject) => {
			*  reject('reject');
			*});

			*p5.then(function(value) {
			*  console.log(value)
			*}).catch(function(reason){
			*  console.log(reason)
			*})
			*/


			return promise
		},

		// 添加一个事件处理回调于当前promise对象，并且在原promise对象解析完毕后，
		// 返回一个新的promise对象。回调会在当前promise运行完毕后被调用，
		// 无论当前promise的状态是完成(fulfilled)还是失败(rejected)
		// 如果最后一个事件处理回调抛出一个错误，则返回一个拒绝状态的promise，
		// 并且拒绝原因为抛出的错误原因
		finally:function(onFinally){
			var promise = new Promise(empty)

			if (typeof onFinally === 'function') {

				this._fulfilledStack.push(makeFinallyfunc(onFinally,promise))

			}

			promise._status = this._status

			promise._value = this._value
			
			setTimeoutPromise(this)
			
			return promise
		}

	}


	function makeFinallyfunc(onFinally,promise){

		return function(value){

			if( typeof onFinally === 'function'){
				var result;
				try {
					result = onFinally(value)
				}
				catch (e) {
					// 如果调用回调函数抛出异常，则直接reject当前promise
					reject(promise, e);
					return false;
				}
				if( result === promise ){
					var reason = new TypeError('TypeError:The return value could not be same with the promise')
					reject(promise,reason)
				}


				//返回闭包函数，用于处理下一个then中的回调函数
				return function(){
					var len;
					if( result instanceof Promise){
							result.then(
							function(value){
								for(var i = 0,len = promise._fulfilledStack.length;i<len;i++){
									return promise._fulfilledStack[i](value)
								}
							},
							function(reason){
								for(var i = 0,len = promise._rejectedStack.length;i<len;i++){
									return promise._rejectedStack[i](reason)
								}
							}
							)
					}else if( result !== undefined && typeof result !== "function"){
						for(var i = 0,len = promise._fulfilledStack.length;i<len;i++){
								return promise._fulfilledStack[i](result)
						}
					}else if( typeof result === "function"){

						return result

					}else if( result === undefined){
						for(var i = 0,len = promise._fulfilledStack.length;i<len;i++){
								return promise._fulfilledStack[i](result)
						}
					}
				}
			}
		}
	}

	function makeFulfilledfunc(onFulfilled,promise,that){

		return function(value){

			if( that._status === Status.REJECTED){

				return reject(promise,that._value)
			}
			if( typeof onFulfilled === 'function'){
				var result;
				try {
					result = onFulfilled(value)
				}
				catch (e) {
					// 如果调用回调函数抛出异常，则直接reject当前promise
					reject(promise, e);
					return false;
				}
				if( result === promise ){
					var reason = new TypeError('TypeError:The return value could not be same with the promise')
					reject(promise,reason)
				}

				// 改变promise的状态和值
				promise._status = Status.FULLFILLED;
				if( typeof result !== 'function' ){
					promise._value = result
				}

				//返回闭包函数，用于处理下一个then中的回调函数
				return function(){
					var len;
					if( result instanceof Promise){
						result.then(
							function(value){
								for(var i = 0,len = promise._fulfilledStack.length;i<len;i++){
									return promise._fulfilledStack[i](value)
								}
							},
							function(reason){
								for(var i = 0,len = promise._rejectedStack.length;i<len;i++){
									return promise._rejectedStack[i](reason)
								}
							}
						)
					}else if( result !== undefined && typeof result !== "function"){
						for(var i = 0,len = promise._fulfilledStack.length;i<len;i++){
								return promise._fulfilledStack[i](result)
						}
					}else if( typeof result === "function"){

						return result

					}else if( result === undefined){
						for(var i = 0,len = promise._fulfilledStack.length;i<len;i++){
								return promise._fulfilledStack[i](result)
						}
					}
				}
			}
		}
	}

	function makeRejectedfunc(onRejected,promise,that){

		return function(value){
			
			
			if( typeof onRejected === 'function'){
				var result;
				try {
					result = onRejected(value)
				}
				catch (e) {
					// 如果调用回调函数抛出异常，则直接reject当前promise
					reject(promise, e);
					return false;
				}
				if( result === promise ){
					var reason = new TypeError('TypeError:The return value could not be same with the promise')
					reject(promise,reason)
				}
				
				// 改变promise的状态和值
				promise._status = Status.FULLFILLED;
				if( typeof result !== 'function' ){
					promise._value = result
				}

				//返回闭包函数，用于处理下一个then中的回调函数
				return function(){
					var len;

					if( result instanceof Promise){
							result.then(
							function(value){
								for(var i = 0,len = promise._fulfilledStack.length;i<len;i++){
									return promise._fulfilledStack[i](value)
								}
							},
							function(reason){
								for(var i = 0,len = promise._rejectedStack.length;i<len;i++){
									return promise._rejectedStack[i](reason)
								}
							})
					}else if( result !== undefined && typeof result !== "function"){
						for(var i = 0,len = promise._fulfilledStack.length;i<len;i++){
								return promise._fulfilledStack[i](result)
						}
					}else if( typeof result === "function"){
						return result
					}else if( result === undefined){
						for(var i = 0,len = promise._fulfilledStack.length;i<len;i++){
								return promise._fulfilledStack[i](result)
						}
					}
				}
			}
		}
	}



	return Promise

})