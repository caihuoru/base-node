
    var indexUrl = 'https://foundjoy.ltd/games/gamePlatform/view/index.html';
    var sinoServers = 'https://foundjoy.ltd/';
    ajax({
        url:sinoServers+'systemSet',
        type:'get',
        success:function (res) {
            var data = JSON.parse(res);
            indexUrl = data.FrontAddr
            sinoServers = data.FrontAddr.split('games/')[0]
        }
    })
    // 封装原生js ajax
    function ajax(){
        var ajaxData = {
            type:arguments[0].type || "GET",
            url:arguments[0].url || "",
            async:arguments[0].async || "true",
            data:arguments[0].data || null,
            dataType:arguments[0].dataType || "text",
            contentType:arguments[0].contentType || "application/x-www-form-urlencoded",
            beforeSend:arguments[0].beforeSend || function(){},
            success:arguments[0].success || function(){},
            error:arguments[0].error || function(){}
        }
        ajaxData.beforeSend()
        var xhr = createxmlHttpRequest();
        xhr.responseType=ajaxData.dataType;
        xhr.open(ajaxData.type,ajaxData.url,ajaxData.async);
        xhr.setRequestHeader("Content-Type",ajaxData.contentType);
        xhr.send(convertData(ajaxData.data));
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if(xhr.status == 200){
                    ajaxData.success(xhr.response)
                }else{
                    ajaxData.error()
                }
            }
        }
    }

    function createxmlHttpRequest() {
        if (window.ActiveXObject) {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    }

    function convertData(data){
        if( typeof data === 'object' ){
            var convertResult = "" ;
            for(var c in data){
                convertResult+= c + "=" + data[c] + "&";
            }
            convertResult=convertResult.substring(0,convertResult.length-1)
            return convertResult;
        }else{
            return data;
        }
    }
    var html = `
        <style>
            .sino{cursor: pointer;position: fixed;transform-origin: left top; box-shadow:0 0 5px 1px rgba(0,0,0,.1);z-index:9999;left:100%;top:50%;transform:translate(-50%,-50%);width: 77px;height: 77px;border-radius: 100px;background: #efefef;transition: All .5s}
            .sino [data-mark='slideDown']{cursor: pointer;position: absolute;width: 70px;height: 70px;right: 3.5px;top: 3.5px;line-height: 50px;text-align: center;color: #ffffff;font-size: 30px;background: url('https://foundjoy.ltd/games/slideDown.png') center no-repeat; background-size:100% 100%}
            .sino [data-mark='slideUp']{cursor: pointer;position: absolute;width: 70px;height: 70px;right: 10px;top: 10px;border-radius: 100px;line-height: 50px;text-align: center;color: #ffffff;font-size: 30px;display: none;background:#efefef url('https://foundjoy.ltd/games/slideUp.png') center no-repeat;z-index: 2;}
            .sino [data-mark='back'],.sino [data-mark='rank']{cursor: pointer;position: absolute;left:40px;top:15px;margin:auto;width: 50px;height: 10px;padding-top: 45px;line-height: 1;text-align: center;color: #9b9b9b;font-size: 20px;display: none;background: url('https://foundjoy.ltd/games/exitBtn.png') top center no-repeat;}
            .sino [data-mark='rank']{left: 120px;background: url('https://foundjoy.ltd/games/rankBtn.png') top center no-repeat;}
            .sinoGameRank{cursor: pointer;position: fixed;left: 0;top: 0;width: 100%;height: 100%;background: rgba(0,0,0,.7);display: none;z-index: 9998;}
            .sinoGameRank [data-mark='main']{width: 610px;height:1010px;overflow: hidden;background: url('https://foundjoy.ltd/games/game/rankBg.png') no-repeat;left: 50%;top: 50%;margin-left: -305px;margin-top: -505px;position: absolute;}
            .sinoGameRank .close{cursor: pointer;position: absolute;width: 50px;height: 50px;background: url('https://foundjoy.ltd/games/close.png') center no-repeat;right: 10px;top: 20px;}
            .sinoGameRank [data-mark='main'] ul{padding: 0;padding-bottom:120px;position: absolute;width: 450px;height: 610px;left: 0;right: 0;margin: auto;top: 295px;overflow-y: scroll;-webkit-overflow-scrolling: touch;}
            .sinoGameRank [data-mark='main'] li,.myRank{line-height: 110px;height: 110px;border-bottom: 1px solid #e5e5e5;color: #1f2025;display: flex;flex-direction: row;align-items: center;justify-content: space-between;}
            .sinoGameRank [data-mark='main'] .list,.sinoGameRank [data-mark='main'] .score span{font-size: 26px;color: #21212c;font-weight: bold;}
            .sinoGameRank [data-mark='main'] .list{width: 100px;text-align: center;margin: 0;}
            .sinoGameRank [data-mark='main'] .name{font-size: 24px;color: #1f2025;margin:auto;margin-left: 20px;width: 240px;text-align:center;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;}
            .sinoGameRank [data-mark='main'] .score{font-size: 20px;color: #21212c;margin:auto;margin-right: 0;}
            .sinoGameRank [data-mark='main'] ul li:nth-child(1) .list span,.sinoGameRank [data-mark='main'] ul li:nth-child(2) .list span,.sinoGameRank [data-mark='main'] ul li:nth-child(3) .list span{display: none;}
            .sinoGameRank [data-mark='main'] ul li:nth-child(1) .list{height: 100%;background: url('https://foundjoy.ltd/games/num1.png') center no-repeat;background-size: 46px;}
            .sinoGameRank [data-mark='main'] ul li:nth-child(2) .list{height: 100%;background: url('https://foundjoy.ltd/games/num2.png') center no-repeat;background-size: 46px;}
            .sinoGameRank [data-mark='main'] ul li:nth-child(3) .list{height: 100%;background: url('https://foundjoy.ltd/games/num3.png') center no-repeat;background-size: 46px;}
            .sinoGameRank [data-mark='main'] ul p{text-align:center;font-size:30px;margin-top:100px;}
            .myRank{width: 490px;height: 120px;line-height: 120px;border:none;position: absolute;left: 0;right: 0;margin: auto;bottom: 80px;background: #f7f3ff;border-radius: 10px;box-shadow: 0 0 5px 5px rgba(186,184,214,.3);}
            .sinoGameRank [data-mark='main'] .myRank .list,.sinoGameRank [data-mark='main'] .myRank .score,.sinoGameRank [data-mark='main'] .myRank .score span{color:#b94d62}
            .sinoGameRank [data-mark='main'] .myRank .list{margin-left:20px}
            .sinoGameRank [data-mark='main'] .myRank .score{margin-right:20px}
            .sinoGameRank [data-mark='main'] .myRank p{width:100%;text-align:center;font-size:30px;margin:0;}
        </style>
        <div class="sino">
            <div data-mark="slideDown"></div>
            <div data-mark="slideUp"></div>
            <div data-mark="back">Exit</div>
            <div data-mark="rank">Rank</div>
        </div>
        <div class="sinoGameRank">
            <div data-mark="main">
                <div class="close"></div>
                <ul>
                    
                </ul>
                <div class="myRank">
                    <div class="list"><span>No.90</span></div>
                    <div class="name">133 8765 4321</div>
                    <div class="score"><span>5555</span>分</div>
                </div>
            </div>
        </div>
  
  `;
    document.write(html);
    // 缩放排行榜自适应屏幕大小
    var scale =function(){
        return document.documentElement.clientWidth*0.9 / 610 || document.body.clientWidth*0.9 / 610;
        // return $(window).width()*0.9 / 610;
    }()
    // 获取高
    var windowHeight=function(){
        return document.documentElement.clientHeight || document.body.clientHeight;
    }()
    // 获取宽
    var windowWidth=function(){
        return document.documentElement.clientWidth || document.body.clientWidth;
    }()

    console.log(scale)


    // console.log($(window).height() , $(window).width()*0.9*1.655)


    if(windowHeight < windowWidth*0.9*1.655){
        scale = windowHeight*0.9 / 1010
        // console.log($(window).height()*0.9,scale)
    }
    // $('.sinoGameRank [data-mark=main],.sino').css({
    //     'transform':'scale('+scale+')'
    // });

    document.querySelector(".sinoGameRank [data-mark=main]").style.cssText="transform:scale("+scale+")";
    document.querySelector(".sino").style.cssText="transform:scale("+scale+") translate(-50%,-50%);";
    // 返回
    document.querySelector('.sino [data-mark=back]').onclick=function(){
        var con = confirm('Are you sure to return to the game platform?');
        if(con == true){
            window.location.href = indexUrl
        }
    }

    // 拖拽
    var mobile   = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    var touchstart = mobile ? "touchstart" : "mousedown";
    var touchend = mobile ? "touchend" : "mouseup";
    var touchmove = mobile ? "touchmove" : "mousemove";
    var x,y,touching,startTime,endTime,endX = '100%',endY = '50%',position = 'right';



    // 展开
    function sinoSlideDown() {
        console.log('slideDown',position,endX,endY)
        var translate;
        switch (position){
            case 'top':
                translate = '-50%,20%'
                break
            case 'right':
                translate = '-120%,-50%'
                break
            case 'bottom':
                translate = '-50%,-120%'
                break
            case 'left':
                translate = '20%,-50%'
                break
        }
        document.querySelector(".sino").style.cssText="transition:All .5s;left:"+endX+";top:"+endY+";width:280px;height:90px;transform:scale("+scale+") translate("+translate+")";

        document.querySelector(".sino [data-mark=slideDown]").style.display="none";
        document.querySelector(".sino [data-mark=slideUp]").style.display="block";
        document.querySelector(".sino [data-mark=back]").style.display="block";
        document.querySelector(".sino [data-mark=rank]").style.display="block";
    }
    document.querySelector(".sino [data-mark=slideDown]").addEventListener(touchstart,function (e) {
        e.preventDefault();
        startTime = new Date();
        touching = true;
        if(mobile){
            var touch = event.touches[0];
            console.log(touch)
            x=touch.clientX;
            y=touch.clientY;
        }else{
            x=e.pageX;
            y=e.pageY;
        }
    });
    document.querySelector("body").addEventListener(touchmove,function (e) {
        if( !touching) return false
        if(mobile){
            var touch = event.touches[0];
            x=touch.clientX;
            y=touch.clientY;
        }else{
            x=e.pageX;
            y=e.pageY;
        }
        document.querySelector(".sino").style.cssText = "transition:none;transform:scale("+scale+") translate(-50%,-50%);left:"+x+"px;top:"+y+"px";
    });
    document.querySelector(".sino [data-mark=slideDown]").addEventListener(touchend,function (e) {
        e.preventDefault()
        touching = false;
        endTime = new Date() - startTime;
        console.log(endTime)
        // 时间小于150毫秒执行点击事件
        if(endTime < 150){
            sinoSlideDown()
        }else{
            if(x <= windowWidth * 0.33){
                endX = '0px';
                endY = y+'px';
                position = 'left'
            }else if(x >= windowWidth * 0.66){
                endX = windowWidth+'px';
                endY = y+'px';
                position = 'right';
            }
            if(y <= windowHeight * 0.33 && x >= windowWidth * 0.15 && x <= windowWidth * 0.85){
                endX = x+'px';
                endY = '0px';
                position = 'top';
            }else if(y >= windowHeight * 0.66 && x >= windowWidth * 0.15 && x <= windowWidth * 0.85){
                endX = x+'px';
                endY = windowHeight+'px';
                position = 'bottom';
            }
            document.querySelector(".sino").style.cssText="transition:All .5s;left:"+endX+";top:"+endY+";width:77px;height:77px;transform:scale("+scale+") translate(-50%,-50%)";
        }

    })
    // 收起
    document.querySelector(".sino [data-mark=slideUp]").onclick=function(){
        sinoSlideUp()
    }
    // 调起排行榜 sinoGetRank(分数单位)
    document.querySelector(".sino [data-mark=rank]").onclick=function(){
        sinoSlideUp();
        var game_id = getUrlParameter('game_id');
        var user_id = getUrlParameter('user_id');
        sinoShowRank(game_id,user_id,'');
    }

    // 关闭排行榜
    document.querySelector(".sinoGameRank .close").onclick=function(){
        document.querySelector(".sinoGameRank").style.display="none";
    }
    // subToRank(40,7,'9999')
    // subToRank() 得分上传(游戏id,用户id,得分)
    function subToRank(game_id,user_id,score) {
        var data ={
            game_id:game_id.toString(),
            doing:'edit',
            json_rank:{
                user_id:user_id.toString(),
                score:score.toString()
            }
        }
        ajax({
            url:sinoServers+'gamerank',
            type:'post',
            data:JSON.stringify(data),
            dataType:'json',
            success:function (res) {
                if(res.edit == "id not find or rank=null"){
                    alert("Game id not find")
                }
                console.log(res)
            }
        })
    }
    function sinoSlideUp() {
        // console.log(endX,endY)
        document.querySelector(".sino").style.cssText="transition:All .5s;left:"+endX+";top:"+endY+";width:77px;height:77px;transform:scale("+scale+") translate(-50%,-50%)";
        document.querySelector(".sino [data-mark=slideDown]").style.display="block";
        document.querySelector(".sino [data-mark=slideUp]").style.display="none";
        document.querySelector(".sino [data-mark=back]").style.display="none";
        document.querySelector(".sino [data-mark=rank]").style.display="none";
    }
    // 显示自带排行榜 (游戏id,用户id,单位)
    function sinoShowRank(game_id,user_id,unit) {
        unit = unit || '';
        sinoGetRankData(game_id,user_id,function (data) {
            console.log(data)
            var rankHtml="";
            var userHtml="<p>No Data For This Game</p>";
            document.querySelector(".sinoGameRank ul").innerHTML = "";
            document.querySelector(".sinoGameRank .myRank").innerHTML = "";

            if(data.length <= 0){
                rankHtml = '<p>No Data For This Game</p>'
            }else{
                for(var i in data){
                    var list = parseInt(i)+1;
                    rankHtml+=`
                        <li>
                            <div class="list"><span>No.${list}</span></div>
                            <div class="name">${data[i].user_id}</div>
                            <div class="score"><span>${data[i].score}</span>${unit}</div>
                        </li>
                    `
                    if( data[i].user_id == getUrlParameter('user_id')){
                        userHtml = `
                            <div class="list"><span>No.${list}</span></div>
                            <div class="name">${data[i].user_id}</div>
                            <div class="score"><span>${data[i].score}</span>${unit}</div>
                        `
                    }
                }
            }
            document.querySelector(".sinoGameRank ul").innerHTML=rankHtml;
            document.querySelector(".sinoGameRank .myRank").innerHTML=userHtml;
            document.querySelector(".sinoGameRank").style.display="block";
        })
    }
    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? null : sParameterName[1];
            }
        }
    }
    // 获取排行数据(如果需要自己做排行榜)
    function sinoGetRankData(game_id,user_id,callback) {
        var resData = [];
        // callback(resData);
        var data ={
            game_id:game_id,
            doing:'select',
        }
        ajax({
            // url:'http://192.168.1.54/'+'gamerank',
            url:sinoServers+'gamerank',
            type:'post',
            data:JSON.stringify(data),
            dataType:'json',
            success:function (res) {
                console.log(res)
                if(res.select == 'id not find or rank=null'){

                }else{
                    res.sort(function (a,b) {
                        return parseInt(b.score) - parseInt(a.score)
                    })
                    resData = res
                }
                callback(resData)
            }
        })
    }
