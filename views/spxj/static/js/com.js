var storageName = '';
var request_url = "https://foundjoy.ltd:8022/";

var lang = 'cn';
var flag = lang != 'en' ? 0 : 1;
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
                <li>
                    <a href="blessings.html">
                        <i class="fa fa-fw fa-list-alt"></i> <span>祝福语编辑管理</span>
                     
                    </a>
                </li>
               
               
            </ul>
        </section>`,
    created: function () {
        $('section.sidebar').remove()
        // var _result = 'index'
        // this.arr = _result;
    },
    mounted: function () {
        // var _that = this;
        // var userToken = getStorage('integralWallToken');
        // let isVip;
        // if (!userToken) {
        //     if (window.location.href.indexOf('login.html') >= 0
        //         || window.location.href.indexOf('register.html') >= 0
        //     ) {

        //     } else {
        //         setStorage('loginTo', window.location.href)
        //         window.location.href = 'login.html'
        //     }
        // } else {
        //     console.log(userToken)
        //     axios({
        //         method: 'post',
        //         url: request_url5 + 'api/user/permissionswall',
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded'
        //         },
        //         data: {
        //             token: userToken
        //         }
        //     }).then(function (res) {
        //         console.log(res)
        //         let resData = res.data;
        //         if (resData.status == 1) {
        //             if (resData.data.is_admin == '1') {

        //             } else {
        //                 alert('你没有管理员权限')
        //                 setStorage('loginTo', window.location.href)
        //                 window.location.href = 'login.html'
        //             }
        //         } else {
        //             if (window.location.href.indexOf('login.html') >= 0
        //                 || window.location.href.indexOf('register.html') >= 0
        //             ) {

        //             } else {
        //                 setStorage('loginTo', window.location.href)
        //                 window.location.href = 'login.html'
        //             }
        //         }
        //         console.log(resData)
        //     })
        // }
    },
    methods: {
        navigateTo: function (url) {
            // window.location.href = url
            console.log(url)
        }
    }
});


// 头部
Vue.component('my-logo', {
    data: function () {
        return {
            miniLogo: '祝福语管理系统',
            lgLogo: '祝福语管理系统'
        }
    },
    template: `
        <!-- Logo -->
        <a href="video.html" class="logo">
            <b class="logo-mini">
               {{miniLogo}}
            </b>
            <span class="logo-lg">
              {{miniLogo}}
          </span>
        </a>`,
    mounted: function () {
        var _that = this;
        // axios({
        //     method: 'post',
        //     // url: '//192.168.1.54/'+'logopush',
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
            account_number: '',
            admin_icon: ''
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
            if (getStorage('UserInfo')) {
                var userInfo = JSON.parse(getStorage('UserInfo'));
                console.log(userInfo)
                _that.admini_name = userInfo.actual_name
                _that.account_number = userInfo.account_number
                _that.admin_icon = userInfo.head_img
                clearInterval(window.UserInfo)
            }
        }, 200)

    },
    methods: {
        loginOut: function () {
            window.location.replace('login.html');
            delStorage('integralWallToken')
            delStorage('UserInfo')
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
    localStorage.setItem(storageName + name, value)
}

function getStorage(name) {
    return localStorage.getItem(storageName + name)
}

function delStorage(name) {
    localStorage.removeItem(storageName + name);
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