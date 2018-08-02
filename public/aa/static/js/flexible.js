(function(doc, win) {
	var docEle = doc.documentElement
	var	isIos = navigator.userAgent.match(/iphone|ipod|ipad/gi)
	var resizeEvent
	var dpr
	/**

	var scale
	var metaEle = doc.createElement('meta')
	**/
	var recalCulate = function() {
		var width = docEle.clientWidth

		if (width >= 750) {
			docEle.style.fontSize = '100px'
		} else {
			docEle.style.fontSize = (100 * (width / 750)) + 'px'
		}
	}

	if (isIos) {
		dpr = Math.min(win.devicePixelRatio, 3)
	} else {
		dpr = 1
	}
	/**
	scale = 1 / dpr
	**/
	resizeEvent = 'orientationchange' in window ? 'orientationchange' : 'resize'
	docEle.dataset.dpr = dpr

	/**
	metaEle.name = 'viewport'
	metaEle.content = 'initial-scale=' + scale + ',maximum-scale=' + scale
	docEle.firstElementChild.appendChild(metaEle)
	**/

	recalCulate()
	if (!doc.addEventListener) {
		return
	}
	win.addEventListener(resizeEvent, recalCulate, false)
})(document, window)