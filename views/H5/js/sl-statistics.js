var startTime;
$(document).ready(function() {
    startTime = new Date().getTime();
    var equipmentType = getEquipmentType();
    var cIp = "";
    var cName = "";
    var wxNo = "";
    var netCode = document.getElementById('slScript').getAttribute('data');
    var hrefUrl = window.location.href;
    var suffix = hrefUrl.substr(hrefUrl.lastIndexOf("#"));
    suffix = suffix.substr(1,suffix.length-1);
    var fullUrl = window.location.href;

    $.getScript('http://pv.sohu.com/cityjson?ie=utf-8',function(){
        cIp = returnCitySN["cip"];
        cName = returnCitySN["cname"];
    });

    $(".weixin").bind("copy",function(){
        wxNo = $(this).html();
        record(cIp,cName,netCode,wxNo,suffix,fullUrl,equipmentType);
    });
});

function record(cIp,cName,netCode,wxNo,suffix,fullUrl,equipmentType){
    var nowTime = new Date().getTime();
    var accessTimes = nowTime - startTime;

    var dataJson = {
        ip: cIp,
        sourceCity: cName,
        code: netCode,
        operatorType: 1,
        wxNo: wxNo,
        suffix: suffix,
        equipmentType: equipmentType,
        accessTimes: accessTimes,
        fullUrl: fullUrl
    };

    $.ajax({
        type: "post",
        //url: "http://localhost:8080/slss/statistics/record",
        url: "http://houtai.1yppp.net/statistics/record",
        data: dataJson,
        dataType: "json",
        success: function(data){
            window.location.href = "weixin://";
        },
        error:function(){
            console.log("fail");
            window.location.href = "weixin://";
        }
    });
}

function getEquipmentType() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod" ];
    var type = "pc";
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            type = Agents[v];
            break;
        }
    }
    return type;
}
