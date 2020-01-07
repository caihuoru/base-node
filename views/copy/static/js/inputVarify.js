var specialKey = "「」[`~!#$^&*()=|{}:;,'\\[\\].<>/?~！#￥……&*（） ——|{}【】‘；：”“。，、？]‘’".split('');
var specialKey1 = "「」[`~#$^&*()=|{}'\\[\\].<>/~#￥……&*（） ——|{}【】‘”“？]‘’".split('');
var specialKey2 = "「」[`~#$^&*()=|{}'\\[\\]<>/~#￥……&*（）——|{}【】‘”“？]‘’".split('');

//英文单引号
function specialChar1(str) {
    var value = str;
    console.log(value)
    for (var i = 0; i < specialKey.length; i++) {
        if (value.indexOf(specialKey[i]) > -1) {
            return true;
        }
    }
    return false;
}

function specialChar2(str) {
    var value = str;
    console.log(value)
    for (var i = 0; i < specialKey1.length; i++) {
        if (value.indexOf(specialKey1[i]) > -1) {
            return true;
        }
    }
    return false;
}

function specialChar3(str) {
    var value = str;
    console.log(value)
    for (var i = 0; i < specialKey2.length; i++) {
        if (value.indexOf(specialKey2[i]) > -1) {
            return true;
        }
    }
    return false;
}

// 正整数
function onlyNumber(num) {
    var reg = /^[+]{0,1}(\d+)$/;
    if (!reg.test(num)) {
        return false;
    }
    return true;
}
// //钱
// function checkMoney(num) {
//     var reg = /^[0-9]*(\.)?[0-9]{0,1,2}$/;
//     if (!reg.test(num)) {
//         return false;
//     }
//     return true;
// }

function telReg(tel) {
    var reg = /^[0-9]*[-]?[0-9]*$/;
    if (!reg.test(tel)) {
        return false;
    }
    return true;
}

function emailReg(tel) {
    var reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    if (!reg.test(tel)) {
        return false;
    }
    return true;
}