var qp_url = 'http://47.115.57.209:7777/';
//var qp_url='http://192.168.1.71:7777/';
var _storage = 'jianFei';
function setStorage(name, value) {
    localStorage.setItem(_storage + name, value)
}

function getStorage(name) {
    return localStorage.getItem(_storage + name)
}

function delStorage(name) {
    localStorage.removeItem(_storage + name);
}
// 获取URL参数
function getUrlParams(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //定义正则表达式
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
}

