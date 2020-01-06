const express = require('express')
const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const net = require('net')
var xmlreader = require("xmlreader");//xml
var querystring = require("querystring");
var mysql = require("mysql");
var request = require("request");
var schedule = require("node-schedule");


var ejs = require("ejs");
// 根据项目的路径导入生成的证书文件
const privateKey = fs.readFileSync(path.join(__dirname, './pem/foundjoy.ltd.key'), 'utf8')
const certificate = fs.readFileSync(path.join(__dirname, './pem/foundjoy.ltd.pem'), 'utf8')
const credentials = {
    key: privateKey,
    cert: certificate,
}
// 设置https的访问端口号
const SSLPORT = 7100
// 设置http的访问端口号
const PORT = 7200
// 创建express实例
const app = express()

// 数据库配置
const config = {
    host: '39.108.10.188',
    user: 'root',
    password: '123456',
    port: '3306',
    database: "wall",
    useConnectionPooling: true
}
var connection = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    database: config.database
});
app.use(express.static(__dirname + '/views'));
app.locals.appName = "WRJ";
app.set("view engine", "jade");
app.set("views", path.resolve(__dirname, "views"));
app.engine("html", ejs.renderFile);
app.use(function (req, res, next) {
    res.locals.userAgent = req.headers["user-agent"];
    next();
});

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// post请求需要
app.post('*', function (req, res, next) {
    var postData = '';
    req.on('data', function (chunk) {
        postData += chunk;
    });
    req.on('end', function () {

        postData = decodeURI(postData);
        postData = postData.replace(/\s+/g, "");
        if (postData.substring(0, 1) === "{") {
            postData = JSON.parse(postData)
        } else if (postData.substring(0, 1) === "<") {
            xmlreader.read(postData, function (errors, response) {
                if (null !== errors) {
                    console.log(errors)
                    return;
                }
                var newObj = {};
                for (k in response) {
                    let isObj = true;
                    try {
                        isObj = eval('(' + response[k] + ')');
                    } catch (e) {
                        isObj = response[k];
                    }
                    if (!response[k] || !isObj || typeof (isObj) != "object") {
                        newObj[k] = response[k];
                        // console.log(newObj[k])
                    } else {
                        function recurOBJ(obj) {
                            for (key in obj) {
                                if (obj[key].text) {
                                    obj[key] = obj[key].text();
                                } else {
                                    recurOBJ(obj[key])
                                }
                                newObj[k] = obj;
                            }
                        }
                        recurOBJ(response[k]);
                    }
                }
                postData = newObj;
            });
        } else {
            postData = querystring.parse(postData)
        }
        console.log(postData)
        req.body = postData;
        next();
    })
});
// 1、引入express的路由模块
var router = express.Router({
    caseSensitive: true // 开启大小写
});


// 这个是所有的路由，必定会走这里。
router.all('*', function (req, res, next) {
    // 判断当前的请求头是 http的话
    if (req.protocol == 'http') {
        // 进行重定向。

        // res.redirect(req.host + req.originalUrl);
    }
})

// 处理请求
// app.get('/', async (req, res) => {
//     res.status(200).send('Hello World!')
// })

app.get('/', function (req, res, next) {
    res.status(200).send('你好!')
});

app.get('/data', function (req, res, next) {
    res.send('isok')
});

app.get("/news/data", (req, res) => {

    fs.readFile(path.join(__dirname, `data/${req.query.type}.json`), 'utf8', function (err, data) {
        if (err) {
            return {
                code: 1,
                msg: "失败"
            }
        }
        res.json({
            code: 1,
            data: JSON.parse(JSON.parse(data)),
            msg: "成功"
        })
    })
})
app.get('/select/gold', function (req, res, next) {
    var sql = "select gold from user_manage where id = " + req.query.userId;
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "失败！"
            })
            return;
        } else {
            res.json({
                code: 1,
                data: result[0],
                msg: "成功"
            })
        }
    })
});
app.post('/gold/news', function (req, res, next) {
    var sql = "select * from user_manage where id = " + req.body.userId;
    //查
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "失败！"
            })
            return;
        } else {
            var modSql = 'UPDATE user_manage SET gold = ? WHERE id = ?';
            var modSqlParams = [result[0].gold += Number(req.body.gold), req.body.userId];
            //添加vip
            connection.query(modSql, modSqlParams, function (err, UPdata) {
                if (err) {
                    console.log('[UPDATE ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "领取金币失败"
                    })
                    return;
                }
                res.json({
                    code: 1,
                    msg: "领取金币成功"
                })
            })
        }
    })
});

// 创建https服务器实例
const httpsServer = https.createServer(credentials, app)
const httpServer = http.createServer(app)



// 启动服务器，监听对应的端口
httpsServer.listen(SSLPORT, () => {
    console.log(`HTTPS已启动`)
})
httpServer.listen(PORT, () => {
    console.log(`HTTP已启动`)
})

// 2、创建服务器进行代理
net.createServer(function (socket) {
    socket.once('data', function (buf) {
        // console.log(buf[0]);
        // https数据流的第一位是十六进制“16”，转换成十进制就是22
        var address = buf[0] === 22 ? SSLPORT : PORT;
        //创建一个指向https或http服务器的链接
        var proxy = net.createConnection(address, function () {
            proxy.write(buf);
            //反向代理的过程，tcp接受的数据交给代理链接，代理链接服务器端返回数据交由socket返回给客户端
            socket.pipe(proxy).pipe(socket);
        });
        proxy.on('error', function (err) {
            console.log(err);
        });
    });
    socket.on('error', function (err) {
        console.log(err);
    });
}, app).listen(8093, () => {
    console.log("服务器启动成功：8093")
}); // 此处是真正能够访问的端口，网站默认是80端口。


// 每天凌晨执行任务(刷新json)
var rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [0, new schedule.Range(1, 6)];

rule.hour = 10;

rule.minute = 17;

var j = schedule.scheduleJob(rule, function () {
    //  代码捎候
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

})
