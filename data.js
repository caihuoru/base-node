var fs = require('fs'); //文件模块
var path = require('path'); //系统路径模块
var express = require('express');
var app = express();
var bodyParser = require('body-parser');//解析,用req.body获取post参数
var ejs = require("ejs");
var port = 8090;
// 允许访问静态目录
app.use(express.static(__dirname + '/views'));
// post请求需要
app.use(bodyParser.urlencoded({ extended: false }));
// const fxp = require("fast-xml-parser");
var xml2js = require('xml2js');

// ejs模板
app.locals.appName = "JFQ";
app.set("view engine", "jade");
app.set("views", path.resolve(__dirname, "views"));
app.engine("html", ejs.renderFile);
app.use(function (req, res, next) {
    res.locals.userAgent = req.headers["user-agent"];
    next();
});
// post请求需要
app.use(bodyParser.urlencoded({ extended: false }));
// xml需要

var dataArr = [
    ["AD", "1"],  //# 安道尔
    ["AE", "1"],  //# 阿联酋
    ["AE", "2"],  //# 阿联酋
    ["AF", "1"],  //# 阿富汗
    ["AG", "1"],  //# 安提瓜和巴布达
    ["AI", "1"],  //# 安圭拉
    ["AL", "1"],  //# 阿尔巴尼亚
    ["AM", "1"],  //# 亚美尼亚
    ["AN", "1"],  //# 荷属安的列斯群岛
    ["AO", "1"],  //# 安哥拉
    ["AR", "1"],  //# 阿根廷
    ["AS", "1"],  //# 美属萨摩亚
    ["AT", "1"],  //# 奥地利
    ["AU", "1"],  //# 澳大利亚
    ["AW", "1"],  //# 阿鲁巴
    ["AX", "1"],  //# 奥兰群岛
    ["AZ", "1"],  //# 阿塞拜疆
    ["BA", "1"],  //# 波黑
    ["BB", "1"],  //# 巴巴多斯
    ["BD", "1"],  //# 孟加拉
    ["BE", "1"],  //# 比利时
    ["BE", "2"],  //# 比利时
    ["BF", "1"],  //# 布基纳法索
    ["BG", "1"],  //# 保加利亚
    ["BH", "1"],  //# 巴林
    ["BI", "1"],  //# 布隆迪
    ["BJ", "1"],  //# 贝宁
    ["BL", "1"],  //# 圣巴泰勒米岛
    ["BM", "1"],  //# 百慕大
    ["BN", "1"],  //# 文莱
    ["BO", "1"],  //# 玻利维亚
    ["BQ", "1"],  //# 荷兰加勒比区
    ["BR", "1"],  //# 巴西
    ["BS", "1"],  //# 巴哈马
    ["BT", "1"],  //# 不丹
    ["BW", "1"],  //# 博茨瓦纳
    ["BY", "1"],  //# 白俄罗斯
    ["BZ", "1"],  //# 伯利兹
    ["CA", "1"],  //# 加拿大
    ["CA", "2"],  //# 加拿大
    ["CC", "1"],  //# 科科斯群岛
    ["CD", "1"],  //# 刚果（金）
    ["CF", "1"],  //# 中非共和国
    ["CG", "1"],  //# 刚果（布）
    ["CH", "1"],  //# 瑞士
    ["CH", "2"],  //# 瑞士
    ["CI", "1"],  //# 科特迪瓦
    ["CK", "1"],  //# 库克群岛
    ["CL", "1"],  //# 智利
    ["CM", "1"],  //# 喀麦隆
    ["CN", "1"],  //# 中国
    ["CN", "2"],  //# 中国
    ["CO", "1"],  //# 哥伦比亚
    ["CR", "1"],  //# 哥斯达黎加
    ["CU", "1"],  //# 古巴
    ["CV", "1"],  //# 佛得角
    ["CW", "1"],  //# 安的列斯群岛
    ["CX", "1"],  //# 圣诞岛
    ["CY", "1"],  //# 塞浦路斯
    ["CZ", "1"],  //# 捷克
    ["DE", "1"],  //# 德国
    ["DJ", "1"],  //# 吉布提
    ["DK", "1"],  //# 丹麦
    ["DM", "1"],  //# 多米尼克
    ["DO", "1"],  //# 多米尼加
    ["DZ", "1"],  //# 阿尔及利亚
    ["EC", "1"],  //# 厄瓜多尔
    ["EE", "1"],  //# 爱沙尼亚
    ["EG", "1"],  //# 埃及
    ["EH", "1"],  //# 西撒哈拉
    ["ER", "1"],  //# 厄立特里亚
    ["ES", "1"],  //# 西班牙
    ["ES", "2"],  //# 西班牙
    ["ET", "1"],  //# 埃塞俄比亚
    ["FI", "1"],  //# 芬兰
    ["FJ", "1"],  //# 斐济群岛
    ["FK", "1"],  //# 马尔维纳斯群岛（福克兰）
    ["FM", "1"],  //# 密克罗尼西亚联邦
    ["FO", "1"],  //# 法罗群岛
    ["FR", "1"],  //# 法国
    ["FR", "2"],  //# 法国
    ["GA", "1"],  //# 加蓬
    ["GB", "1"],  //# 英国
    ["GB", "2"],  //# 英国
    ["GD", "1"],  //# 格林纳达
    ["GE", "1"],  //# 格鲁吉亚
    ["GF", "1"],  //# 法属圭亚那
    ["GG", "1"],  //# 根西岛
    ["GH", "1"],  //# 加纳
    ["GI", "1"],  //# 直布罗陀
    ["GL", "1"],  //# 格陵兰
    ["GM", "1"],  //# 冈比亚
    ["GN", "1"],  //# 几内亚
    ["GP", "1"],  //# 瓜德罗普
    ["GQ", "1"],  //# 赤道几内亚
    ["GR", "1"],  //# 希腊
    ["GT", "1"],  //# 危地马拉
    ["GU", "1"],  //# 关岛
    ["GW", "1"],  //# 几内亚比绍
    ["GY", "1"],  //# 圭亚那
    ["HK", "1"], // # 香港
    ["HN", "1"],  //# 洪都拉斯
    ["HR", "1"],  //# 克罗地亚
    ["HT", "1"],  //# 海地
    ["HU", "1"],  //# 匈牙利
    ["ID", "1"],  //# 印尼
    ["IE", "1"],  //# 爱尔兰
    ["IE", "2"],  //# 爱尔兰
    ["IL", "1"],  //# 以色列
    ["IM", "1"],  //# 马恩岛
    ["IN", "1"],  //# 印度
    ["IO", "1"],  //# 英属印度洋领地
    ["IQ", "1"],  //# 伊拉克
    ["IR", "1"],  //# 伊朗
    ["IS", "1"],  //# 冰岛
    ["IT", "1"],  //# 意大利
    ["IT", "2"],  //# 意大利
    ["JE", "1"],  //# 泽西岛
    ["JM", "1"],  //# 牙买加
    ["JO", "1"],  //# 约旦
    ["JP", "1"],  //# 日本
    ["KE", "1"],  //# 肯尼亚
    ["KG", "1"],  //# 吉尔吉斯斯坦
    ["KH", "1"],  //# 柬埔寨
    ["KI", "1"],  //# 基里巴斯
    ["KM", "1"],  //# 科摩罗
    ["KN", "1"],  //# 圣基茨和尼维斯
    ["KP", "1"],  //# 朝鲜
    ["KR", "1"],  //# 韩国
    ["KW", "1"],  //# 科威特
    ["KY", "1"],  //# 开曼群岛
    ["KZ", "1"],  //# 哈萨克斯坦
    ["LA", "1"],  //# 老挝
    ["LB", "1"],  //# 黎巴嫩
    ["LC", "1"],  //# 圣卢西亚
    ["LI", "1"],  //# 列支敦士登
    ["LK", "1"],  //# 斯里兰卡
    ["LR", "1"],  //# 利比里亚
    ["LS", "1"],  //# 莱索托
    ["LT", "1"],  //# 立陶宛
    ["LU", "1"],  //# 卢森堡
    ["LV", "1"],  //# 拉脱维亚
    ["LY", "1"],  //# 利比亚
    ["MA", "1"],  //# 摩洛哥
    ["MC", "1"],  //# 摩纳哥
    ["MD", "1"],  //# 摩尔多瓦
    ["ME", "1"],  //# 黑山
    ["MF", "1"],  //# 法属圣马丁
    ["MG", "1"],  //# 马达加斯加
    ["MH", "1"],  //# 马绍尔群岛
    ["MK", "1"],  //# 马其顿
    ["ML", "1"],  //# 马里
    ["MM", "1"],  //# 缅甸
    ["MN", "1"],  //# 蒙古国蒙古
    ["MO", "1"],  //# 澳门
    ["MP", "1"],  //# 北马里亚纳群岛
    ["MQ", "1"],  //# 马提尼克
    ["MR", "1"],  //# 毛里塔尼亚
    ["MS", "1"],  //# 蒙塞拉特岛
    ["MT", "1"],  //# 马耳他
    ["MU", "1"],  //# 毛里求斯
    ["MV", "1"],  //# 马尔代夫
    ["MW", "1"],  //# 马拉维
    ["MX", "1"],  //# 墨西哥
    ["MX", "2"],  //# 墨西哥
    ["MY", "1"],  //# 马来西亚
    ["MZ", "1"],  //# 莫桑比克
    ["NA", "1"],  //# 纳米比亚
    ["NC", "1"],  //# 新喀里多尼亚
    ["NE", "1"],  //# 尼日尔
    ["NF", "1"],  //# 诺福克岛
    ["NG", "1"],  //# 尼日利亚
    ["NI", "1"],  //# 尼加拉瓜
    ["NL", "1"],  //# 荷兰
    ["NL", "2"],  //# 荷兰
    ["NO", "1"],  //# 挪威
    ["NP", "1"],  //# 尼泊尔
    ["NR", "1"],  //# 瑙鲁
    ["NU", "1"],  //# 纽埃
    ["NZ", "1"],  //# 新西兰
    ["OM", "1"],  //# 阿曼
    ["PA", "1"],  //# 巴拿马
    ["PE", "1"],  //# 秘鲁
    ["PF", "1"],  //# 法属波利尼西亚
    ["PG", "1"],  //# 巴布亚新几内亚
    ["PH", "1"],  //# 菲律宾
    ["PK", "1"],  //# 巴基斯坦
    ["PL", "1"],  //# 波兰
    ["PM", "1"],  //# 圣皮埃尔和密克隆
    ["PN", "1"],  //# 皮特凯恩群岛
    ["PR", "1"],  //# 波多黎各
    ["PS", "1"],  //# 巴勒斯坦
    ["PT", "1"],  //# 葡萄牙
    ["PT", "2"],  //# 葡萄牙
    ["PW", "1"],  //# 帕劳
    ["PY", "1"],  //# 巴拉圭
    ["QA", "1"],  //# 卡塔尔
    ["RE", "1"],  //# 留尼汪
    ["RO", "1"],  //# 罗马尼亚
    ["RS", "1"],  //# 塞尔维亚
    ["RU", "1"],  //# 俄罗斯
    ["RW", "1"],  //# 卢旺达
    ["SA", "1"],  //# 沙特阿拉伯
    ["SB", "1"],  //# 所罗门群岛
    ["SC", "1"],  //# 塞舌尔
    ["SD", "1"],  //# 苏丹
    ["SE", "1"],  //# 瑞典
    ["SG", "1"],  //# 新加坡
    ["SH", "1"],  //# 圣赫勒拿
    ["SI", "1"],  //# 斯洛文尼亚
    ["SJ", "1"],  //# 斯瓦尔巴群岛和扬马延岛
    ["SK", "1"],  //# 斯洛伐克
    ["SL", "1"],  //# 塞拉利昂
    ["SM", "1"],  //# 圣马力诺
    ["SN", "1"],  //# 塞内加尔
    ["SO", "1"],  //# 索马里
    ["SR", "1"],  //# 苏里南
    ["SS", "1"],  //# 南苏丹
    ["ST", "1"],  //# 圣多美和普林西比
    ["SV", "1"],  //# 萨尔瓦多
    ["SX", "1"],  //# 圣马丁
    ["SY", "1"],  //# 叙利亚
    ["SZ", "1"],  //# 斯威士兰
    ["TC", "1"],  //# 特克斯和凯科斯群岛
    ["TD", "1"],  //# 乍得
    ["TG", "1"],  //# 多哥
    ["TH", "1"],  //# 泰国
    ["TJ", "1"],  //# 塔吉克斯坦
    ["TK", "1"],  //# 托克劳
    ["TL", "1"],  //# 东帝汶
    ["TM", "1"],  //# 土库曼斯坦
    ["TN", "1"],  //# 突尼斯
    ["TO", "1"],  //# 汤加
    ["TR", "1"],  //# 土耳其
    ["TT", "1"],  //# 特立尼达和多巴哥
    ["TV", "1"],  //# 图瓦卢
    ["TW", "1"],  //# 台湾
    ["TZ", "1"],  //# 坦桑尼亚
    ["UA", "1"],  //# 乌克兰
    ["UG", "1"],  //# 乌干达
    ["UM", "1"],  //# 美国本土外小岛屿
    ["US", "1"],  //# 美国
    ["US", "2"],  //# 美国
    ["UY", "1"],  //# 乌拉圭
    ["UZ", "1"],  //# 乌兹别克斯坦
    ["VA", "1"],  //# 梵蒂冈
    ["VC", "1"],  //# 圣文森特和格林纳丁斯
    ["VE", "1"],  //# 委内瑞拉
    ["VG", "1"],  //# 英属维尔京群岛
    ["VI", "1"],  //# 美属维尔京群岛
    ["VN", "1"],  //# 越南
    ["VU", "1"],  //# 瓦努阿图
    ["WF", "1"],  //# 瓦利斯和富图纳
    ["WS", "1"],  //# 萨摩亚
    ["YE", "1"],  //# 也门
    ["YT", "1"],  //# 马约特
    ["ZA", "1"],  //# 南非
    ["ZM", "1"],  //# 赞比亚
    ["ZW", "1"]  //# 津巴布韦
]
const request = require('request');
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
var builder = new xml2js.Builder();  // JSON->xml
var parser = new xml2js.Parser();   //xml -> json
// for (var i = 0; i < dataArr.length; i++) {
//     (function (i) {
//         request({
//             url: `https://www.dji.com/cn/api/no-fly/country/${dataArr[i][0]}?version=${dataArr[i][1]}`,
//             timeout: 30000

//         }, function (error, response, body) {
//             console.log(`https://www.dji.com/cn/api/no-fly/country/${dataArr[i][0]}?version=${dataArr[i][1]}`)
//             console.log(response.statusCode)
//             //把data对象转换为json格式字符串
//             var content = JSON.stringify(body);
//             //指定创建目录及文件名称，__dirname为执行当前js文件的目录
//             var file = path.join(__dirname, `data/${dataArr[i][0]}-${dataArr[i][1]}.json`);

//             //写入文件
//             fs.writeFile(file, content, function (err) {
//                 if (err) {
//                     return console.log(err);
//                 }
//                 console.log('文件创建成功，地址：' + file);
//             });

//         })
//     }(i))

// }

var jsonArr = ["top", "shehui", "guonei", "yule", "tiyu", "junshi", "keji", "caijing"]

for (var i = 0; i < jsonArr.length; i++) {

    (function (i) {
        request({
            url: `http://v.juhe.cn/toutiao/index?type=${jsonArr[i]}&key=5d8e56169c03c28faca50a266b3b4188`,
            timeout: 30000

        }, function (error, response, idbody) {
            var file = path.join(__dirname, `data/${jsonArr[i]}.json`);

            //写入文件
            fs.writeFile(file, JSON.stringify(idbody), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log('文件创建成功，地址：' + file);
            });

        })
    }(i))
}


// request({
//     url: `https://restapi.amap.com/v3/geocode/geo?key=03068365dcc9ca7ec6db154941fe9327&address=中国 浙江 宁海县科技园区科二路195号`,
//     timeout: 30000

// }, function (error, response, body) {

//     // http://news-at.zhihu.com/api/4/news/{id}


//     // var json = parser.parseString(body);

//     body = JSON.parse(body)
//     console.log(body)
//     for (var i = 0; i < body.stories.length; i++) {
//         // console.log(body.top_stories[i].id)
//         (function (i) {
//             request({
//                 url: `http://news-at.zhihu.com/api/4/news/${body.stories[i].id}`,
//                 timeout: 30000

//             }, function (error, response, idbody) {
//                 var file = path.join(__dirname, `data/${body.stories[i].id}.json`);

//                 //写入文件
//                 fs.writeFile(file, JSON.stringify(idbody), function (err) {
//                     if (err) {
//                         return console.log(err);
//                     }
//                     console.log('文件创建成功，地址：' + file);
//                 });

//             })
//         }(i))

//     }
//     // console.log(json)

//     // var tObj = parser.getTraversalObj(body, options);
//     // var jsonObj = parser.convertToJson(tObj, options);
//     // jsonObj = JSON.stringify(jsonObj)
//     //指定创建目录及文件名称，__dirname为执行当前js文件的目录
//     var file = path.join(__dirname, `data / news.json`);

//     //写入文件
//     fs.writeFile(file, JSON.stringify(body), function (err) {
//         if (err) {
//             return console.log(err);
//         }
//         console.log('文件创建成功，地址：' + file);
//     });

// })

let server = app.listen(port, function () {

    console.log('服务器运行成功');

});


// https://picman.1688.com/open/ajax/RecommendAlbumDetailList.json?memberId=ivansolar2010&jsResponseDataName=albumList1583489062883&hasRecAlbums=true&hasAlbums=true&start=1&end=200&recommendAlbumIds=14492547%2C13802970%2C153335375%2C161758230


var jsonArr = ["top", "shehui", "guonei", "yule", "tiyu", "junshi", "keji", "caijing"]

for (var i = 0; i < jsonArr.length; i++) {

    (function (i) {
        request({
            url: `https://restapi.amap.com/v3/geocode/geo?key=03068365dcc9ca7ec6db154941fe9327&address=中国 浙江 宁海县科技园区科二路195号`,
            timeout: 30000

        }, function (error, response, idbody) {
            var file = path.join(__dirname, `data/${jsonArr[i]}.json`);

            //写入文件
            fs.writeFile(file, JSON.stringify(idbody), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log('文件创建成功，地址：' + file);
            });

        })
    }(i))
}