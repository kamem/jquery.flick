/*
 * jQuery flick
 *
 * jQuery required.
 *
 * Copyright 2012 (c) kamem
 * http://develo.org/
 * Licensed Under the MIT.
 *
 * Date: 2012.4.8
*/

(function($,global){
/*-------------------------------------------------------------------------------------
	ウィンドウサイズ
-------------------------------------------------------------------------------------*/
var windowWidth = (!(window.innerWidth)) ? document.documentElement.clientWidth : window.innerWidth;
var windowHeight = (!(window.innerHeight)) ?  document.documentElement.clientHeight : window.innerHeight;

/*-------------------------------------------------------------------------------------
	ユーザーエージェントにより判別
-------------------------------------------------------------------------------------*/
var userAgent = navigator.userAgent;

userAgent.match(/iPhone OS (\w+){1,3}/g);
userAgent.match(/CPU OS (\w+){1,3}/g);
/*
 * iPhone iPad のiOSを判別
 */
var osVar=(RegExp.$1.replace(/_/g, '')+'00').slice(0,3);

/*
 * ユーザーエージェント判別 配列
 */
var ua = {
	iPhone : userAgent.search(/iPhone/) !== -1,
	iPad : userAgent.search(/iPad/) !== -1,
	Android : ((userAgent.search(/Android/) !== -1) && (userAgent.search(/Mobile/) !== -1)) && (userAgent.search(/SC-01C/) == -1),
	AndroidTab : (userAgent.search(/Android/) !== -1) && ((userAgent.search(/Mobile/) == -1) || (userAgent.search(/SC-01C/) !== -1)),
	Android3_2 : userAgent.search(/Android 3.2/) !== -1,
	iOS5_less : ((userAgent.search(/iPhone/) !== -1) || (userAgent.search(/iPad/) !== -1)) && (osVar < 500),
	other : !(
	(userAgent.search(/iPhone/) !== -1) || 
	(userAgent.search(/iPad/) !== -1) || 
	(((userAgent.search(/Android/) !== -1) && (userAgent.search(/Mobile/) !== -1)) && (userAgent.search(/SC-01C/) == -1)) || 
	((userAgent.search(/Android/) !== -1) && ((userAgent.search(/Mobile/) == -1) || (userAgent.search(/SC-01C/) !== -1)))
	)
}
/*
 * モバイル判別
 */
var mobile = ua.iPhone || ua.iPad || ua.Android || ua.AndroidTab;


/*
 * アニメーション終了 判別
 */
var type = "transition";
/*
 * イベント判別
 */
var eventType = {
	touchStart: mobile ? 'touchstart' : 'mousedown',
	touchEnd: mobile ? 'touchend' : 'mouseup',
	touchMove: mobile ? 'touchmove' : 'mousemove',
	animationEnd: (!(userAgent.toLowerCase().indexOf("webkit") == -1)) ? ((type == "transition") ? "webkitTransitionEnd" : "webkitAnimationEnd") : 
(!(userAgent.toLowerCase().indexOf("gecko") == -1)) ? ((type == "transition") ? "transitionend" : "animationend") :
(!(userAgent.toLowerCase().indexOf("opera") == -1)) ? ((type == "transition") ? "oTransitionEnd" : "oAnimationend") :
(!(userAgent.toLowerCase().indexOf("msie 10.0") == -1)) ? ((type == "transition") ? "MSTransitionEnd" : "MSAnimationend") : ""
};

/*
 * CSS ブラウザによってのベンダープレフィックス振り分け
 */
var cssPrefix = 
(!(userAgent.toLowerCase().indexOf("webkit") == -1)) ? '-webkit-' : 
(!(userAgent.toLowerCase().indexOf("gecko") == -1)) ? '-moz-' :
(!(userAgent.toLowerCase().indexOf("opera") == -1)) ? '-o-' :
(!(userAgent.toLowerCase().indexOf("msie 10.0") == -1)) ? '-ms-' : "";

var cssTransition = cssPrefix + 'transition';
var cssTransform = cssPrefix + 'transform';
var cssTranslate = {
	prefix : (!(userAgent.toLowerCase().indexOf("webkit") == -1)) ? 'translate3d(' : 'translate(',
	suffix : (!(userAgent.toLowerCase().indexOf("webkit") == -1)) ? 'px,0,0)' : 'px,0)'
}

/*
 * translateの設定
 * webkitの場合 translate3d
 * firefoxの場合 translate
 */
function getCssTranslate(moveX) {	
	if(css3) {
		return cssTranslate.prefix + moveX + cssTranslate.suffix;
	}
	else {
		return moveX + 'px';
	}
}

/*-------------------------------------------------------------------------------------
	flick プラグイン
-------------------------------------------------------------------------------------*/
$.fn.flick = function(options) {

	options = $['extend']({
		contentNum: 0,
		centerPosition: true,
		speed: 200,
		timer: false
	}, options);

	//----------------------------------------
	//	初期設定
	//----------------------------------------
	var $content = this,
	$container = $('.container',this),
	$itemBox = $('.itemBox',this),
	$item = $('.item',this),
	$nav = $('.flickNav',this),
	$nav_a = $('a',$nav),
	$prev = $('.prev',this),
	$next = $('.next',this);
	
	css3 = $('body').css(cssTransform) == 'none';
	if(!css3) {cssTransform = 'left'};

	var containerOffsetLeft = 0,
	containerBaseX = 0,

	contentNum = options.contentNum,
	
	startX = 0,
	endX = 0,
	startY = 0,
	startTime = 0,
	startLeft = 0,
	flickStartCount = 0,

	activeBool = true,
	isMoving = false;
	$itemBox.css({width : $item.eq(0).width() * $item.length});
	$itemBox.css(cssTransform,'translate(0,0)');


	//----------------------------------------
	//	タイマーで自動で回す
	//----------------------------------------
	if(options.timer) {
		setInterval(function(){
			contentNum = ($item.length - 1 > contentNum) ? contentNum+1 : 0;
			move(contentNum);
		},options.timer);
	}

	//----------------------------------------
	//	アンカーリンクでコンテナーがスクロールしちゃうときコンテナーの位置を0の位置に移動
	//----------------------------------------
	$container.scroll(function() {
		$(this).scrollLeft(0);
	});

	//----------------------------------------
	//	アドレスにハッシュが入っている場合 その位置移動
	//----------------------------------------
	if(location.hash.charAt(0) == "#") {
		var hashNum = location.hash.slice(1,location.hash.length).match(/[0-9]+/)
		var hashName = location.hash.slice(1,location.hash.indexOf(hashNum));
		
		var itemId = $item[0].id;
		var itemNum = itemId.slice(0,itemId.length).match(/[0-9]+/)
		var itemName = itemId.slice(0,itemId.indexOf(itemNum));
		
		if(hashName == itemName) {
			setTimeout(function() {
			move(Number(hashNum) -1);
			}, 1)
		}
	}

	//----------------------------------------
	//	タッチしたときの処理
	//----------------------------------------
	$container.bind(eventType.touchStart, function(e){
		var touch = mobile ? e.originalEvent.touches[0] : e;

		startX = mobile ? touch.pageX : touch.clientX;
		startY = mobile ? touch.pageY : touch.clientY;
		startTime = new Date().getTime();
		isMoving = true;


		startLeft = getTranslateX() - containerOffsetLeft -  containerBaseX;
		
        if($itemBox.hasClass('moving')) {
			$itemBox.removeClass('moving');
			$itemBox.css(cssTransform, getCssTranslate(containerBaseX + startLeft));
        }
		
		//console.log(translateX + '+' + containerOffsetLeft + '-' + containerBaseX + '=' + (translateX - containerOffsetLeft - containerBaseX))
	});

	//----------------------------------------
	//	要素内でドラックしてる時の処理
	//----------------------------------------
	$container.bind(eventType.touchMove, function(e){
		var touch = mobile ? e.originalEvent.touches[0] : e,
		touchpageX = mobile ? touch.pageX : touch.clientX;
		touchpageY = mobile ? touch.pageY : touch.clientY;
		
		// 要素内でクリックしたら実行
		if(isMoving) {
			
			var diffX = containerBaseX + touchpageX - startX,
			diffY = touchpageY - startY,
			diffX2 = touchpageX - startX;
			if(activeBool){
				if((diffX2/diffY) > 0.5 || (diffX2/diffY) < -0.5) {
					if(mobile) {event.preventDefault()};

					flickStartCount++;
					
					// 横スクロールしだした時にコンテナーの位置に移動
					if(options.centerPosition && (flickStartCount == 1)) {
						var pageWrapTag = $.support.boxModel ? navigator.appName.match(/Opera/) ? "html" : "html,body" : "body";
						$(pageWrapTag).animate({ scrollTop : $container.offset().top}, 300);
					};
					
					$itemBox.css(cssTransform, getCssTranslate(startLeft + diffX));
				}
				else {
					if(flickStartCount < 5) {
						activeBool = false;
					}
					else {
					if(mobile) {event.preventDefault()};

						$itemBox.css(cssTransform,getCssTranslate(startLeft + diffX));
					}
				}
			}
		}
	});

	//----------------------------------------
	//	タッチが終わったときの処理
	//----------------------------------------
	$container.bind(eventType.touchEnd, function(e){
		var touch = mobile ? e.originalEvent.changedTouches[0] : e;
		endX = mobile ? touch.pageX : touch.clientX;

		flickStartCount = 0;
		startLeft = 0;
		activeBool = true;
		isMoving = false;
		
		move();
	});

	//----------------------------------------
	//	ウィンドウサイズ変更 ＆ 読み込み時
	//----------------------------------------
	$(window).bind(('orientationchange resize load'), function(){
		$itemBox.css({width : $item.eq(0).width() * $item.length});
		
        containerOffsetLeft = $container.offset().left;
		containerBaseX = ($container.innerWidth() - $item.eq(0).width()) / 2;
		
		/* ウィンドウエリアいっぱいに広げる場合
		windowWidth = (!(window.innerWidth)) ? document.documentElement.clientWidth : window.innerWidth;
		if($container.width() > windowWidth) {
			$container.css({width : windowWidth})
		}
		*/

		if(!css3) {
			$itemBox.queue([]).stop()
		}
		move(contentNum);
	});

	//----------------------------------------
	//	指定位置コンテンツ位置までの動き 関数
	//----------------------------------------
	function move(num) {
		contentNum = (typeof num === 'number') ? num : contentNum;
		$itemBox.addClass('moving');
		
		var endTime = new Date().getTime(),
		timeDiff = endTime - startTime,
		distanceX = endX - startX;

		// numが数字じゃないとき
		if(!(typeof num === 'number')) {
			if (timeDiff < 300 && Math.abs(distanceX) > 30) {
				contentNum = (distanceX > 0) ? contentNum - 1 : contentNum + 1;
			}
			else {
	            d = Math.abs((getTranslateX() - containerOffsetLeft) - containerBaseX - $item.eq(0).width() / 2);
	            contentNum = Math.floor(d / $item.eq(0).width());
			}
		}
 
 		//contentNumが0以下フリックの数以上に行かないように制限する
		contentNum = (contentNum > $item.length - 1) ? $item.length - 1 :
		(contentNum < 0) ? 0 : contentNum;
		
        // マウスを話したときのコンテンツの位置から
		if(css3) {
			$itemBox.css(cssTransform, getCssTranslate(containerBaseX + $item.eq(0).width() * contentNum * -1));
		}
		else {
			$itemBox.animate({
				left : getCssTranslate(containerBaseX + $item.eq(0).width() * contentNum * -1)
			}, options.speed );
		}
		
		//next prevのクラス操作
		$prev.add($next).removeClass('off');
		if(contentNum >= $item.length-1) {$next.addClass('off')}
		else if(contentNum <= 0) {$prev.addClass('off')}
		
		//navのクラス操作
		$nav_a.parent().removeClass('selected').eq(contentNum).addClass('selected');
	}

	//----------------------------------------
	//	ボタンを押したとき
	//----------------------------------------
	//nav
	$nav_a.bind('click', function() {
		move($nav_a.index(this));
		return false;
	});
	
	//prev
	$prev.bind('click', function() {
		contentNum--;

		//contentNumが0以下フリックの数以上に行かないように制限する
		contentNum = (contentNum > $item.length - 1) ? $item.length - 1 :
		(contentNum < 0) ? 0 : contentNum;

		move(contentNum);
		return false;
	});

	//next
	$next.bind('click', function() {
		contentNum++;

		//contentNumが0以下フリックの数以上に行かないように制限する
		contentNum = (contentNum > $item.length - 1) ? $item.length - 1 :
		(contentNum < 0) ? 0 : contentNum;

		move(contentNum);
		return false;
	});

	/*
	 * translateのxの値 取得
	 * firefoxとwebkitで取得の仕方が違うようです。
	 */
	function getTranslateX() {
		if(css3) {
			return (userAgent.toLowerCase().indexOf("firefox") == -1) ?
			$itemBox.offset().left : parseInt(/(,.+?){3} (.+?)px/.exec($itemBox.css(cssTransform))[2]) + containerOffsetLeft;
		}
		else {
			return $itemBox.offset().left;
		}
	}
};

jQuery.extend(jQuery.easing,{
	def:"easeOutQuad",
	easeOutQuad:function(j,i,b,c,d){return -c*(i/=d)*(i-2)+b;}
});

}(jQuery,this));
