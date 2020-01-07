var express = require('express');
var app = express();
var server_port = 8022;
var querystring = require("querystring");
var mysql = require('mysql');
var ejs = require("ejs");
var path = require("path");
var xmlreader = require("xmlreader");//xml
const https = require('https')
const http = require('http')
const net = require('net')
const fs = require('fs')
// 根据项目的路径导入生成的证书文件
const privateKey = fs.readFileSync(path.join(__dirname, './pem/foundjoy.ltd.key'), 'utf8')
const certificate = fs.readFileSync(path.join(__dirname, './pem/foundjoy.ltd.pem'), 'utf8')
const credentials = {
    key: privateKey,
    cert: certificate,
}
// 设置https的访问端口号
const SSLPORT = 7103
// 设置http的访问端口号
const PORT = 7203
const config = {
    host: '39.108.10.188',
    user: 'root',
    password: '123456',
    port: '3306',
    database: "camera",
    useConnectionPooling: true
}
var connection = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    database: config.database
});

// 允许访问静态目录
app.use(express.static(__dirname + '/views'));
// ejs模板
app.locals.appName = "JFQ";
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
        // console.log(postData)
        req.body = postData;
        next();
    })
});
app.get('/', function (req, res, next) {
    res.json("...正在完善")
});

// 创建https服务器实例
const httpsServer = https.createServer(credentials, app)
const httpServer = http.createServer(app)



// 数据库连接(包含断开重连)
let con;

function handleDisconnect() {
    con = mysql.createPool(config);
    con.getConnection(function (err) {
        if (err) {
            console.log('进行断线重连：' + new Date());
            setTimeout(handleDisconnect, 2000);   //2秒重连一次
            return;
        }
        console.log('数据库连接成功');
    });
    con.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });

}
handleDisconnect();




app.get('/select/blessings', (req, res) => {
    let pageSize = req.query.pageSize || 10;
    // var sql = `select *, count(0) as total from blessings limit ${(req.query.index - 1) * pageSize},${pageSize};`;
    var sql = `select * from blessings`
    console.log(sql)
    connection.query(sql, function (err, Data) {
        if (err) {
            res.json({
                code: 0,
                msg: "数据错误"
            })
            // console.log(err)
            return false;
        }
        if (req.query.index) {
            //总数
            var length = Data.length;
            //可分页数
            var total = Math.ceil(Data.length / pageSize);

            var backData = [];


            //10==每页条数
            var num = (req.query.index - 1) * pageSize;
            for (var i = 0; i < pageSize; i++) {
                if (Data[num + i]) {
                    backData.push(Data[num + i])
                } else {
                    break;
                }
            }
            Data = backData;
        } else {
            // var total = 1;
        }
        res.json({
            code: 1,
            total: total,
            data: Data,
            msg: "成功"
        })

    })
})

// 点赞
app.post('/blessings/like', (req, res) => {
    var sql = `select * from blessings where id =${parseInt(req.body.blessingsId)}`
    connection.query(sql, function (err, Data) {
        if (err) {
            res.json({
                code: 0,
                msg: "数据错误"
            })
            // console.log(err)
            return false;
        } else {
            var linkNum = Data[0].like_;
            if (parseInt(Data[0].like_) == NaN) {
                linkNum = 0;
            } else {
                linkNum = Data[0].like_ + 1;;
            }
            // var addSql = 'UPDATE blessings SET content = ? , author=?  WHERE id = ?';
            var addSql = `UPDATE blessings SET like_ = ?  WHERE id = ?`;
            var addSqlParams = [linkNum, parseInt(req.body.blessingsId)];
            //增
            connection.query(addSql, addSqlParams, function (err, result2) {
                if (err) {
                    res.json({
                        code: 0,
                        msg: "失败"
                    })
                    console.log(err)
                    return;
                } else {
                    res.json({
                        code: 1,
                        msg: "成功"
                    })
                }
            })
        }
    })
})

// 添加祝福语
app.post('/add/blessings', (req, res) => {

    var addSql = 'INSERT INTO blessings(content,author,date) VALUES(?,?,?)';
    var addSqlParams = [req.body.content, req.body.author, timestampToTime(new Date() / 1000, true)];
    //增
    connection.query(addSql, addSqlParams, function (err, result2) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            res.json({
                status: 0,
                msg: "失败"
            })
            return;
        } else {
            res.json({
                status: 1,
                msg: "成功"
            })
        }
    })
})

// 编辑祝福语
app.post('/edit/blessings', (req, res) => {
    var addSql = 'UPDATE blessings SET content = ? , author=?  WHERE id = ?';
    var addSqlParams = [req.body.content, req.body.author, parseInt(req.body.id)];
    //增
    connection.query(addSql, addSqlParams, function (err, result2) {
        if (err) {
            res.json({
                status: 0,
                msg: "失败"
            })
            return;
        } else {
            res.json({
                status: 1,
                msg: "成功"
            })
        }
    })
})

// 删除祝福语
app.post('/del/blessings', (req, res) => {
    var Sql = `DELETE FROM blessings WHERE id = ${parseInt(req.body.id)}`;
    //增
    connection.query(Sql, function (err, result2) {
        if (err) {
            res.json({
                status: 0,
                msg: "失败"
            })
            return;
        } else {
            res.json({
                status: 1,
                msg: "成功"
            })
        }
    })
})


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
}, app).listen(server_port, () => {
    console.log("服务器启动成功：" + server_port)
}); // 此处是真正能够访问的端口，网站默认是80端口。


// 随机生成订单
function token(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
// 时间戳
function timestampToTime(timestamp, all) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = (date.getDate() + 1 < 10 ? '0' + (date.getDate() + ' ') : date.getDate() + ' ');
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    if (all) {
        return Y + M + D + h + m + s;
    } else {
        return Y + M + D//+h+m+s;
    }
}
var urlEncode = function (param, key, encode) {
    if (param == null) return '';
    var paramStr = '';
    var t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
        paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
    } else {
        for (var i in param) {
            var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
            paramStr += urlEncode(param[i], k, encode);
        }
    }
    return paramStr;
};

