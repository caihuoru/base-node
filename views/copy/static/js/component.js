var isLogin = getCookie('token');
// var request_url="https://foundjoy.ltd/";
var request_url = "http://120.78.184.57/";
var request_url2 = "http://120.78.184.57/";
var request_url3 = "http://120.78.184.57:8090/";//蔡火儒的接口
// var lang = getCookie('language');
var lang = 'cn';
var flag = lang != 'en' ? 0 : 1;
// console.log(lang,'cookie-language');
var _language = {
    "sProcessing": "处理中...",
    "sLengthMenu": "显示 _MENU_ 项结果",
    "sZeroRecords": "没有匹配结果",
    "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
    "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
    "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
    "sInfoPostFix": "",
    "sSearch": "搜索:",
    "sUrl": "",
    "sEmptyTable": "表中数据为空",
    "sLoadingRecords": "载入中...",
    "sInfoThousands": ",",
    "oPaginate": {
        "sFirst": "首页",
        "sPrevious": "上页",
        "sNext": "下页",
        "sLast": "末页"
    },
    "oAria": {
        "sSortAscending": ": 以升序排列此列",
        "sSortDescending": ": 以降序排列此列"
    }
}
// if (!isLogin) {
//     window.location.replace('login.html');
// } else {
//     console.log('token:' + isLogin)
// }
// 左侧菜单组件
Vue.component('left-section', {
    props: ['first', 'second'],
    data: function () {
        return {
            arr: 'index'
        }
    },
    template: `
        <section class="sidebar">
            <!-- sidebar menu-->
            <ul class="sidebar-menu" data-widget="tree">
                <li :class=" first == 'rwgl' ? 'treeview active menu-open' : 'treeview' " v-if="arr.indexOf('index') >= 0">
                    <a href="#">
                        <i class="fa fa-fw fa-list-alt"></i> <span>设置</span>
                        <span class="pull-right-container"> <i class="fa fa-fw fa-angle-right pull-right"></i> </span>
                    </a>
                    <ul class="treeview-menu" style="display:block;">
                        <li><a href="edit.html"><i class="fa fa-fw fa-circle-thin"></i>链接编辑</a></li>
                        <li><a href="tongji.html"><i class="fa fa-fw fa-circle-thin"></i>渠道统计</a></li>
                    </ul>
                </li>
            </ul>
        </section>`,
    created: function () {
        $('section.sidebar').remove()
        // var _result = 'index'
        // this.arr = _result;
    },
    mounted: function () {
        var _that = this;
        // 权限验证
        // axios({
        //     method:'post',
        //     url:'https://foundjoy.ltd/permissions',
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        //     data:{
        //         token:getCookie('token')
        //     }
        // }).then(function (res) {
        //     var data = res.data;
        //     if(data.code == 0){
        //         // console.log(data)
        //         setCookie('UserInfo',JSON.stringify(data.UserInfo[0]))
        //     }else{
        //         alert('登陆信息失效,请重新登陆');
        //         delCookie('token')
        //         delCookie('UserInfo')
        //         window.location.replace('login.html')
        //     }
        //     _that.arr = data.UserInfo[0].authority;
        //     // 验证是否有权限访问当前页面 没有跳转回有权限的第一个页面
        //     var path = window.location.href.split('/');
        //     path = path[path.length - 1].split('.')[0];
        //     if (_that.arr.indexOf(path) < 0) {
        //         window.location.href = _that.arr.split(',')[0] + '.html'
        //     }
        //     // console.log(path)
        //     // console.log(data.UserInfo[0].authority)
        // })
    },
    methods: {
        navigateTo: function (url) {
            window.location.href = url
            console.log(url)
        }
    }
});


// 头部
Vue.component('my-logo', {
    data: function () {
        return {
            miniLogo: 'http://foundjoy.ltd/games/gamePlatformSystem/server/php/files/miniLogo%20%286%29.png',
            lgLogo: 'http://foundjoy.ltd/games/gamePlatformSystem/server/php/files/lgLogo%20%286%29.png'
        }
    },
    template: `
        <!-- Logo -->
        <a href="index.html" class="logo">
            <b class="logo-mini">
                <span class="light-logo">后台管理</span>
                <span class="dark-logo">后台管理</span>
            </b>
            <span class="logo-lg">
              <img :src="lgLogo" style="width: 130px;" alt="logo" class="light-logo">
              <img :src="lgLogo" style="width: 130px;" alt="logo" class="dark-logo">
          </span>
        </a>`,
    mounted: function () {
        var _that = this;
        // axios({
        //     method: 'post',
        //     // url: 'http://192.168.1.54/'+'logopush',
        //     url: request_url+'logopush',
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        //     data: {
        //         doing:'select'
        //     },
        // }).then(function (res) {
        //     var data = res.data;
        //     _that.lgLogo = data.long_logo
        //     _that.miniLogo = data.short_logo
        //     console.log(data)
        // })
    }
});
// 导航
Vue.component('my-nav', {
    data: function () {
        return {
            admini_name: '',
            account_number: ''
        }
    },
    template: `
        <nav class="navbar navbar-static-top">
            <!-- Sidebar toggle button-->
            <div>
                <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
                    <span class="sr-only">Toggle navigation</span>
                </a>
            </div>
            <div class="navbar-custom-menu">
                <ul class="nav navbar-nav">
                   
                    <!-- User Account-->
                    <li class="dropdown user user-menu">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                            <img src="static/picture/user5-128x128.jpg" class="user-image rounded-circle"
                                 alt="User Image">
                        </a>
                        <ul class="dropdown-menu scale-up">
                            <!-- User image -->
                            <li class="user-header">
                                <img src="static/picture/user5-128x128.jpg" class="float-left rounded-circle"
                                     alt="User Image">

                                <p>
                                    {{admini_name}}
                                    <small class="mb-5">{{account_number}}</small>
                                </p>
                            </li>
                            <!-- Menu Body -->
                            <li class="user-body">
                                <div class="row no-gutters">
                                   
                                    <div role="separator" class="divider col-12"></div>
                                    <div class="col-12 text-left">
                                        <a href="#" @click="loginOut"><i class="fa fa-fw fa-power-off"></i> Logout</a>
                                    </div>
                                </div>
                                <!-- /.row -->
                            </li>
                        </ul>
                    </li>
                    <!-- Control Sidebar Toggle Button -->
                </ul>
            </div>
        </nav>`,
    created: function () {
        var _that = this;
        window.UserInfo = setInterval(function (e) {
            // console.log(getCookie('UserInfo'));
            if (getCookie('UserInfo')) {
                var userInfo = JSON.parse(getCookie('UserInfo'));
                _that.admini_name = userInfo.admini_name
                _that.account_number = userInfo.account_number
                clearInterval(window.UserInfo)
            }
        }, 200)

    },
    methods: {
        loginOut: function () {
            window.location.replace('login.html');
            delCookie('token')
            delCookie('UserInfo')
        }
    }
})

function setCookie(name, value, path, expires) {
    var str = name + "=" + escape(value);
    if (path == "") {
        path = '/';
        str += ";path=" + path;
    }
    if (expires > 0) {
        var date = new Date();
        var ms = expires * 3600 * 1000;
        date.setTime(date.getTime() + ms);
        str += ";expires=" + date.toGMTString();
    }
    document.cookie = str;
}

function getCookie(name) {
    var arrStr = document.cookie.split(";");
    for (var i = 0; i < arrStr.length; i++) {
        var tmp = arrStr[i].replace(' ', '').split("=");
        if (tmp[0] == name) return unescape(tmp[1]);
    }
}

function delCookie(name) {
    var date = new Date();
    date.setTime(date.getTime() - 100000);
    document.cookie = name + "=a; expires=" + date.toGMTString();
}

function setStorage(name, value) {
    localStorage.setItem(name, value)
}

function getStorage(name) {
    return localStorage.getItem(name)
}

function delStorage(name) {
    localStorage.removeItem(name);
}

// 获取最近7天日期
function getSevenDay() {
    var date = new Date();
    // console.log('today:%s',date)
    var arr = [
        getDate(date - 86400000 * 7),
        getDate(date - 86400000 * 6),
        getDate(date - 86400000 * 5),
        getDate(date - 86400000 * 4),
        getDate(date - 86400000 * 3),
        getDate(date - 86400000 * 2),
        getDate(date - 86400000 * 1)
    ]
    console.log(arr)
    return arr
}
function getDate(date) {
    date = new Date(date)
    var year = date.getFullYear();
    var month = getNumber(date.getMonth() + 1);
    var day = getNumber(date.getDate());
    return (year + '-' + month + '-' + day)
}
function getNumber(num) {
    num < 10 ? num = '0' + num : '';
    return num
}
//深度克隆
function deepClone(obj) {
    var result, oClass = isClass(obj);
    //确定result的类型
    if (oClass === "Object") {
        result = {};
    } else if (oClass === "Array") {
        result = [];
    } else {
        return obj;
    }
    for (key in obj) {
        var copy = obj[key];
        if (isClass(copy) == "Object") {
            result[key] = arguments.callee(copy);//递归调用
        } else if (isClass(copy) == "Array") {
            result[key] = arguments.callee(copy);
        } else {
            result[key] = obj[key];
        }
    }
    return result;
}
//返回传递给他的任意对象的类
function isClass(o) {
    if (o === null) return "Null";
    if (o === undefined) return "Undefined";
    return Object.prototype.toString.call(o).slice(8, -1);
}
function formatDate(val) {
    return val >= 10 ? val : '0' + val
}
function timestampToTime(timestampm, all) {
    var date = new Date(timestampm * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = (date.getDate() + 1 < 10 ? '0' + (date.getDate() + ' ') : date.getDate() + ' ');
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();

    return Y + M + D//+h+m+s;

}