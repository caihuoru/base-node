var express = require('express');
var app = express();
var server_port = 8097;
var querystring = require("querystring");
var mysql = require('mysql');
var Pay = require('cn-pay');
var ejs = require("ejs");
var path = require("path");
var private_key = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD4+QaEXeXB6TiLO6jfMXH6YCYoob8H+ojO3KHIMLZMRCrv60mIVZzQLmR3ewi36Va6IAQ25LEZab57s8ZMOArzaco1RbZKrfJvIi2vPI9Aa/Q7TLM8iXofR9HNgoCRwesMczoKheyLtaTnjJBPlgN+HGMBqJS2KSRcBTK23Im0H76ofMZ/RBIRYE3dyV54Gk24Pac/O0H0AgjbRYmnHGkW2BnXchemLC6FbNVMfhSKeEZ0ksmhjwOQBClZ11ZVRw7UwlX8Gyjvt4HpRWM+expuXbNEs6D1lrGIRm/2QD+P3NKRYqo/j0Efl+cfh0BL39AF3M9zTFgW0JeSk5Dev0BNAgMBAAECggEBAMPzWsm7DSV85N/QaKyhQc+I9P9tregdqqcExt/EVvXXgOOrDwiaOP0wRiozTz1QDM4YfLinbStPKng5mYxLX3MMg/VBlKNaHECTadlNlIFjdalmSHsQyGjuIZXZbE9LjC8UUU4O8YlTwSHsY3f/3WfX96RKhiCIaPFzteJt2INGG2TQYJPtW99TRB36ZBUSPwfLMVbBA2ih4cOKRDsG42kkMDNZb5A+lplHTslioPUbkafPj+uFtcCcmmfloO7DIiHzqyRPTsvDy/0v714JTqGA+AGrnizrDbYU5awQrowYyv2IIPiqthS6WnIF0ed4Ay0XEodoJsumiMf7Xl5pnIECgYEA/dBCps9uKbr4S4P0Krx/rabXCysA6wpNWgXE82nkGWCEAxSNMWGU4MfOhBhOHwrgblFiiO+DJpPlN1ABniUp7WzZIgDfYi3WHpHW4hr+pfJQwaqHdkOChhjM3pktwE2+webONAXrGSDzhQhYz4GFM/iPbIGYcJ1kAPFij8zX8NkCgYEA+x4W9TNeokEWvDSOk3H1fYi5XqpDOQbIlVD3P1Fa3N1NHS0O2oG/EwRnTh+Nq/cpv2JfmkZ06spwFpCYMSXy61d73nnhnC2RdmUriedZXz+FlLLU1fElAvNDgqDMPtUhL756Boe5KqNMQuZxGy3s5AMqkRvvlxeGLSPXTFelYpUCgYBNJ4u7TX79bHqh6gDFJPvi+76PBImI6V7OKMbP/7Z5CF/Y19x70GADXHmoqgLFaPcEUfUUD0rc5UReZhG30zBFnjr7HSzKmYhnTon1vaL/KwPle0Mmbis1PEC6wfGobXm5U8IHCm2G+/9Kx1jH62VkgQCISXTfdti5eKcvc2OJMQKBgQCrPfqj3RL0jHRHhYOQko64u0rFfk/3DGQuRpdEa2MN6C+U7MwLP50gB8m2oZfHo/WpGBlfqBpEniXPjWzrXxiHWhITRYQPL5fZZ+ZH1SbB6BxcqZKwDhCSMXdhFewSEN7fowGtgFJJ/C+eE20f/rJjTrFxYN6CZz1NfPptifsy/QKBgGrE0q3FPxvXSMNQ8jANzgii2RQQaMfPhomxhj7zpd4H0OiZhlDNuTrzvbVCguM6veb9n+ehqU+EzukjKyxmmSpOtAsX0CS46apRoisF3lni5Ar5o/FixX+PkLO+RuTvyZtZPPaqNFQVotFV6BS2VLTswZdmnw9sYtVhgR5yzYor"; // 商户私钥 注意：此处不是文件路径，一定要是文件内容
var public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoURPGE5fyvF43fKKHP2ip4t0r0Fag/1i9ba2Nir6FBPyMJFJ3W6OWTZEjGfXkgZaxxw1sYEKUoxsouBlj+K12XXt0mb6ZUb9Udfok6u9+WcQEjiOeB842Yp50xHeqGgdgmGdOg4teZZ4Fk1p2uJn4dRa1x7pD03cT7ozPatounj6KEMDJqOX8z5nBtn7xPkS0RYzF3u8GDOXShdRhkO6tG4AHqKC1sb3OZwToAzUz3ba/cu2a/UyO5wAPDgEE1D6JMMfNQTAFviVINkjFqf9U8EYH4LIQi825iMpDen/N70Vk7gtv0vqlOmb+S+XdA5ZTnQ06TGZyhJxN5fHxj7l/wIDAQAB"; // 支付宝公钥 注意：此处不是文件路径，一定要是文件内容

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
// 支付配置
const payConfig = {
    app_id: '2019051064471085', // appid
    private_key: private_key,
    public_key: public_key,
    notify_url: 'http://39.108.10.188:8097/payBack', // 通知地址
    return_url: 'http://39.108.10.188:8097/return', // 跳转地址
    dev: false // 设置为true 将启用开发环境的支付宝网关
}
// vip支付
var alipay = Pay.alipay(payConfig);
// 数据库配置
const config = {
    host: '39.108.10.188',
    user: 'root',
    password: '123456',
    port: '3306',
    database: "copyUrl",
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

// 支付
app.post('/pay', function (req, res, next) {
    connection = mysql.createConnection(mysqlConfig);
    if (!req.body.money) {
        res.json({
            code: 0,
            err: "缺少金额",
            msg: "生成订单失败"
        })
    }
    var payObj = {
        userid: req.body.id || null,
        money: req.body.money,
        order_time: function () {
            var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            return timestampToTime(timestamp)
        }(),
        order_number: function () {
            var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            return "JFQ" + token(2) + timestamp;
        }(),
    }
    if (!payObj.userid) {
        res.json({
            code: 0,
            err: "缺少用户id",
            msg: "生成订单失败"
        })
        return false;
    }
    //生成订单
    var addSql = 'INSERT INTO order_list(userid,money,order_status,order_time,viptype,order_number,pay_scene) VALUES(?,?,?,?,?,?,?)';
    var addSqlParams = [payObj.userid, payObj.money, payObj.statuts, payObj.order_time, payObj.viptype, payObj.order_number, 0];

    connection.query(addSql, addSqlParams, function (err, backData) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            res.json({
                code: 0,
                err: err.message,
                msg: "生成订单失败"
            })
            return;
        }


        var order = {
            out_trade_no: payObj.order_number,
            total_amount: payObj.money, // 单位 元
            subject: '积分墙任务发布'

        }

        const wapOrder = {
            out_trade_no: payObj.order_number,
            total_amount: payObj.money, // 单位 元
            subject: '积分墙任务发布'
        }
        var wap = { html: "", payload: "", endpoint: "" }
        wap = alipay.wap(wapOrder) // 此方法返回Promise


        const result = alipay.app(order) // 此方法返回Promise
        // console.log(result)
        result.then(function (rs) {
            // 此方法获取Promise
            wap.then(function (wap) {
                // console.log(wap)
                res.json({
                    code: 1,
                    data: {
                        wapHtml: wap,
                        result: rs,
                        order: payObj.order_number
                    },
                    msg: "成功"
                })
            })

        });
    })
});

// 支付
app.post('/pay/again', function (req, res, next) {
    connection = mysql.createConnection(mysqlConfig);
    if (!req.body.taskId) {
        res.json({
            code: 0,
            err: "缺少任务id",
            msg: "查询订单失败"
        })
        return;
    }
    var sql = "select * from task_list where id = " + Number(req.body.taskId);
    connection.query(sql, function (err, order) {
        if (err) {
            console.log(err)
            res.json({
                code: 0,
                msg: "参数格式出错无法查询"
            })
            return;
        }

        var sql = "select * from order_list where order_number = '" + order[0].order_number + "'";
        connection.query(sql, function (err, orderData) {
            if (err) {
                res.json({
                    code: 0,
                    msg: "参数格式出错无法查询订单"
                })
                return;
            }
            if (orderData.length === 0) {
                res.json({
                    code: 0,
                    msg: "该订单不存在"
                })
                return;
            }
            if (Number(orderData[0].order_status) === 1) {
                res.json({
                    code: 0,
                    msg: "该订单已支付"
                })
                return;
            }
            const wapOrdera = {
                out_trade_no: orderData[0].order_number,
                total_amount: orderData[0].money, // 单位 元
                subject: '积分墙任务发布'
            }
            var wap = { html: "", payload: "", endpoint: "" }
            wap = alipay.wap(wapOrdera) // 此方法返回Promise
            wap.then(function (wap) {
                console.log(wap)
                var url = urlEncode(wap.payload)
                url = "https://openapi.alipay.com/gateway.do?" + url;
                res.json({
                    code: 1,
                    data: {
                        url: url,
                        order: orderData[0].order_number
                    },
                    msg: "成功"
                })
            })
        })
    })

})

app.get('/return', (req, res) => {
    if (alipay.verify(req.query)) { // 验签
        connection = mysql.createConnection(mysqlConfig);
        // res.send('支付成功！！！' + JSON.stringify(req.query))
        var sql = "select * from order_list where order_number = '" + req.query.out_trade_no + "'";
        connection.query(sql, function (err, orderData) {
            if (err) {
                return false;
            }
            var orderData = orderData[0];
            console.log(orderData)
            res.type("html");
            res.render("release.ejs", {
                data: {
                    money: req.query.total_amount,
                    userId: orderData.userid,
                    order_number: orderData.order_number
                }
            });

        })

    } else {
        res.send('支付失败！！！' + JSON.stringify(req.query))
    }
})

app.get('/select/ordre', (req, res) => {
    if (!req.query.order_number) {
        res.json({
            code: 0,
            msg: "订单不能为空"
        })
        return;
    }
    connection = mysql.createConnection(mysqlConfig);
    var sql = "select * from order_list where order_number = '" + req.query.order_number + "'";
    connection.query(sql, function (err, orderData) {
        if (err) {
            res.json({
                code: 0,
                msg: "数据错误"
            })
            return false;
        }
        if (orderData[0].order_status) {
            if (orderData[0].order_status == "1") {
                res.json({
                    code: 1,
                    msg: "支付成功"
                })
                return;
            } else {
                res.json({
                    code: 0,
                    msg: "未支付"
                })
                return;
            }


        } else {
            res.json({
                code: 0,
                msg: "支付失败"
            })
            return;
        }

    })
})

// 支付宝回调
app.post('/payBack', (req, res) => {
    connection = mysql.createConnection(mysqlConfig);
    console.log(req.body)
    var sql = "select * from order_list where order_number = '" + req.body.out_trade_no + "'";
    //查
    connection.query(sql, function (err, orderData) {
        // console.log(orderData)
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "数据错误"
            })
            return;
        }
        if (orderData.length === 0) {
            res.json({
                code: 0,
                msg: "订单不存在"
            })
            return;
        } else {
            orderData = orderData[0];
            if (orderData.statuts == 1) {
                res.json({
                    code: 0,
                    msg: "订单已支付"
                })
                return;
            }


            var sql = "select * from user_manage WHERE id = '" + orderData.userid + "'";
            //查
            connection.query(sql, function (err, userData) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "参数错误"
                    })
                    return;
                }
                if (userData.length === 0) {
                    console.log("用户不存在")
                    res.json({
                        code: 0,
                        msg: "用户不存在"
                    })
                    return;
                }

                var modSql = 'UPDATE order_list SET order_status = ?  WHERE order_number = ?';
                var modSqlParams = [1, req.body.out_trade_no];
                //添加viporderlist
                connection.query(modSql, modSqlParams, function (err, hh) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    var modSql = 'UPDATE task_list set approval_status = ?  WHERE order_number = ?';
                    var modSqlParams = ["审核中", req.body.out_trade_no];
                    connection.query(modSql, modSqlParams, function (err, hh) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);
                            return;
                        }
                        console.log('--------------------------UPDATE----------------------------');
                        console.log("支付成功回调")
                        if (alipay.verify(req.body)) { //验签
                            console.log('支付宝异步验签成功：')
                            res.send('SUCCESS')
                        } else {
                            console.log('支付宝异步验签失败：')
                            res.send('ERROR')
                        }
                    })



                })

            })
        }
    })

})


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
}, app).listen(server_port, () => {
    console.log("服务器启动成功：" + server_port)
}); // 此处是真正能够访问的端口，网站默认是80端口。




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

// 提现审核
app.post('/withdrawllReviewwall', (req, res) => {
    var postData = '';
    req.on('data', function (chunk) {
        postData += chunk;
    });
    req.on('end', function () {
        postData = decodeURI(postData);
        if (postData.indexOf('}') > -1) {
            postData = JSON.parse(postData)
        } else {
            postData = querystring.parse(postData)
        }
        if (!postData.audit_status || !postData.id || !postData.user_id) {
            console.log("审核状态与id与用户id不能为空")
            res.json({
                status: 0,
                msg: "审核状态与id与用户id不能为空"
            })
        }
        postData.reason_rejection = postData.reason_rejection || null;
        if (postData.audit_status == "审核通过") {
            var modSql = 'UPDATE withdraw SET audit_status = ?, reason_rejection = ?, s_date = ?, with_status = ? WHERE id = ?';
            var modSqlParams = [postData.audit_status, postData.reason_rejection, timestampToTime(new Date() / 1000, true), "已提现", postData.id];
        } else if (postData.audit_status == "审核驳回") {
            var modSql = 'UPDATE withdraw SET audit_status = ?, reason_rejection = ?, s_date = ?, with_status = ? WHERE id = ?';
            var modSqlParams = [postData.audit_status, postData.reason_rejection, timestampToTime(new Date() / 1000, true), "未提现", postData.id];
        } else {
            // var modSql = 'UPDATE withdraw SET audit_status = ?, reason_rejection = ? WHERE id = ?';
            // var modSqlParams = [postData.audit_status,postData.reason_rejection,postData.id];
            res.json({
                status: 0,
                msg: "无更改"
            })
            return;
        }


        //更新
        connection.query(modSql, modSqlParams, function (err, UPdata) {
            if (err) {
                res.json({
                    status: 0,
                    msg: "数据错误"
                })
                return;
            }
            var sql = "select * FROM user_manage where id = " + postData.user_id;
            connection.query(sql, function (err, Data) {
                if (err) {
                    res.json({
                        status: 0,
                        msg: "查询数据错误"
                    })
                    return;
                }
                // console.log(Data)
                if (Data.length === 0) {
                    res.json({
                        status: 0,
                        msg: "无数据"
                    })
                    return false;
                } else {
                    var withdraw_money = Data[0].withdraw_money -= postData.money
                    if (withdraw_money < 0) {
                        res.json({
                            status: 0,
                            msg: "提现金额不足"
                        })
                        return false;
                    }
                    if (postData.audit_status == "审核通过") {
                        var modSql = 'UPDATE user_manage SET withdraw_money = ? WHERE id = ?';
                        var modSqlParams = [withdraw_money, postData.user_id];
                    } else if (postData.audit_status == "审核驳回") {
                        if (postData.money_type == '充值余额') {
                            var modSql = 'UPDATE user_manage SET withdraw_money = ?, pay_remain = ? WHERE id = ?';
                            var modSqlParams = [withdraw_money, Data[0].pay_remain + postData.money + postData.service_charge, postData.user_id];
                        } else {
                            var modSql = 'UPDATE user_manage SET withdraw_money = ?, cash_remain = ? WHERE id = ?';
                            var modSqlParams = [withdraw_money, Data[0].cash_remain += postData.money + postData.service_charge, postData.user_id];
                        }
                        var addSql = 'INSERT INTO pay_in_out(user_id,s_date,money,money_type,info) VALUES(?,?,?,?,?)';
                        var addSqlParams = [postData.user_id, timestampToTime(new Date() / 1000, true), postData.money, "提现驳回", postData.money_type + "收入" + postData.money + "元"];

                        connection.query(addSql, addSqlParams, function (err, backData) {
                            if (err) {
                                res.json({
                                    status: 0,
                                    msg: "生成资金记录失败"
                                })
                                return;
                            }

                        })

                    }
                    connection.query(modSql, modSqlParams, function (err, UPdata) {
                        if (err) {
                            res.json({
                                status: 0,
                                msg: "数据错误"
                            })
                            return;
                        }
                        var sql = "select withdraw.*,user_manage.accounts_receivable,user_manage.payment_account,user_manage.account_number from withdraw inner join user_manage on withdraw.user_id=user_manage.id and withdraw.audit_status!='不通过' and withdraw.audit_status!='审核驳回' and withdraw.with_status!='已提现'";
                        connection.query(sql, function (err, Data) {
                            res.json({
                                status: 1,
                                list: Data,
                                msg: "成功"
                            })
                        })


                    })
                }
            })

        })
    })
})
// 提现审核查询
app.get('/withdrawllReviewwall', (req, res) => {
    var sql = "select withdraw.*,user_manage.accounts_receivable,user_manage.payment_account,user_manage.account_number from withdraw inner join user_manage on withdraw.user_id=user_manage.id and withdraw.audit_status!='不通过' and withdraw.audit_status!='审核驳回' and withdraw.with_status!='已提现' order by id desc";
    connection.query(sql, function (err, Data) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                status: 0,
                msg: "查询数据错误"
            })
            return;
        }
        // console.log(Data)
        if (Data.length === 0) {
            res.json({
                status: 0,
                list: [],
                msg: "无数据"
            })
            return false;
        } else {
            res.json({
                status: 1,
                list: Data,
                msg: "成功"
            })
        }
    })
})
