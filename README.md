jquery.flick
==================

iPhone,Android,PCで使えるフリック操作が実現できるjQuery Plugin


仕様
------
1. IEに対応（IE6〜）
2. フリックエリア クリック時、フリックした場合には「縦方向のスクロールストップ」。
3. 普通に縦方向にスクロールした場合には「フリックの操作をストップ」する。
4. フリックした時、フリックエリアの頭までスクロールする。
5. 初回の「フリックコンテンツの位置」を指定する。
6. アドレスに「フリックコンテンツ位置のID（ハッシュ）」を指定することにで、そのコンテンツへ移動する。
7. タイマーで時間が来ると次のコンテンツへ移動する。


使い方
------
	<script type="text/javascript" src="js/jquery.js"></script>
	<script type="text/javascript" src="js/jquery.flick.js"></script>
	<script type="text/javascript">
		$("#flick").flick();
	</script>

オプション
------

 * contentNum : 0 スタートが何番目から始まるか
 * centerPosition :  true or false フリック操作をした時にコンテンツの位置までスクロールするか
 * speed: 200 フリック操作を話した時のスピード（pcの場合）
 	transitionが使えるブラウザの場合には cssで指定した値が有効（transition: transform .2s ease-out;）
 * timer: false コンテンツをタイマーで回すか（回す場合は時間を指定、回さない場合はfalse）


### 初期設定 ###

	contentNum: 0,
	centerPosition: true,
	speed: 200,
	timer: false


必須なCSS
------
	div.container {
		overflow: hidden;
	}
	div.itemBox {
		position: relative;
	}
	div.container .item {
		float: left;
	}
	.moving {
 		-webkit-transition: -webkit-transform .2s ease-out;
		-moz-transition: -moz-transform .2s ease-out;
 		-o-transition: -o-transform .2s ease-out;
 		-ms-transition: -ms-transform .2s ease-out;
	}

付与するclass
------
 * セレクトされているflickNavのクラスは「selected」
 * 「next」「prev」の次or前のコンテンツがない場合のクラスは「end」

補足
------
 * IE6で使用する場合は、「container」に幅をいれるようにしてください。
 * PCサイトで使う場合で、コンテンツの中にimgが入ってる場合には、フリック時に画像をドラックしてしまいます。imgに「pointer-events: none;」 を入れるとドラックされないようになります。


ライセンス
----------
+ Copyright 2012 &copy; kamem
+ [http://www.opensource.org/licenses/mit-license.php][mit]

[develo.org]: http://develo.org/ "develo.org"
[MIT]: http://www.opensource.org/licenses/mit-license.php