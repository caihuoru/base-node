var express = require('express');
var app = express();
var bodyParser = require('body-parser');//解析,用req.body获取post参数
var port = 8095;
var mysql = require('mysql');
var ipaddress = getIPAdress();//ip地址
var schedule = require("node-schedule");
var Pay = require('cn-pay');
var ejs = require("ejs");
var path = require("path");
const nodemailer = require("nodemailer");
const config = {
    service: "qq",
    user: '3300729997@qq.com',
    pass: 'qfjjgjwvrqswcjej'//注：此处为授权码，并非邮箱密码
}
var day = 86400;
//邮箱配置
const smtpTransport = nodemailer.createTransport({
    host: "smtp.163.com",
    secureConnection: true,
    port: 587,
    service: config.service,
    auth: {
        user: config.user,
        pass: config.pass
    },
    tls: { ciphers: 'SSLv3' }
});

var private_key = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD4+QaEXeXB6TiLO6jfMXH6YCYoob8H+ojO3KHIMLZMRCrv60mIVZzQLmR3ewi36Va6IAQ25LEZab57s8ZMOArzaco1RbZKrfJvIi2vPI9Aa/Q7TLM8iXofR9HNgoCRwesMczoKheyLtaTnjJBPlgN+HGMBqJS2KSRcBTK23Im0H76ofMZ/RBIRYE3dyV54Gk24Pac/O0H0AgjbRYmnHGkW2BnXchemLC6FbNVMfhSKeEZ0ksmhjwOQBClZ11ZVRw7UwlX8Gyjvt4HpRWM+expuXbNEs6D1lrGIRm/2QD+P3NKRYqo/j0Efl+cfh0BL39AF3M9zTFgW0JeSk5Dev0BNAgMBAAECggEBAMPzWsm7DSV85N/QaKyhQc+I9P9tregdqqcExt/EVvXXgOOrDwiaOP0wRiozTz1QDM4YfLinbStPKng5mYxLX3MMg/VBlKNaHECTadlNlIFjdalmSHsQyGjuIZXZbE9LjC8UUU4O8YlTwSHsY3f/3WfX96RKhiCIaPFzteJt2INGG2TQYJPtW99TRB36ZBUSPwfLMVbBA2ih4cOKRDsG42kkMDNZb5A+lplHTslioPUbkafPj+uFtcCcmmfloO7DIiHzqyRPTsvDy/0v714JTqGA+AGrnizrDbYU5awQrowYyv2IIPiqthS6WnIF0ed4Ay0XEodoJsumiMf7Xl5pnIECgYEA/dBCps9uKbr4S4P0Krx/rabXCysA6wpNWgXE82nkGWCEAxSNMWGU4MfOhBhOHwrgblFiiO+DJpPlN1ABniUp7WzZIgDfYi3WHpHW4hr+pfJQwaqHdkOChhjM3pktwE2+webONAXrGSDzhQhYz4GFM/iPbIGYcJ1kAPFij8zX8NkCgYEA+x4W9TNeokEWvDSOk3H1fYi5XqpDOQbIlVD3P1Fa3N1NHS0O2oG/EwRnTh+Nq/cpv2JfmkZ06spwFpCYMSXy61d73nnhnC2RdmUriedZXz+FlLLU1fElAvNDgqDMPtUhL756Boe5KqNMQuZxGy3s5AMqkRvvlxeGLSPXTFelYpUCgYBNJ4u7TX79bHqh6gDFJPvi+76PBImI6V7OKMbP/7Z5CF/Y19x70GADXHmoqgLFaPcEUfUUD0rc5UReZhG30zBFnjr7HSzKmYhnTon1vaL/KwPle0Mmbis1PEC6wfGobXm5U8IHCm2G+/9Kx1jH62VkgQCISXTfdti5eKcvc2OJMQKBgQCrPfqj3RL0jHRHhYOQko64u0rFfk/3DGQuRpdEa2MN6C+U7MwLP50gB8m2oZfHo/WpGBlfqBpEniXPjWzrXxiHWhITRYQPL5fZZ+ZH1SbB6BxcqZKwDhCSMXdhFewSEN7fowGtgFJJ/C+eE20f/rJjTrFxYN6CZz1NfPptifsy/QKBgGrE0q3FPxvXSMNQ8jANzgii2RQQaMfPhomxhj7zpd4H0OiZhlDNuTrzvbVCguM6veb9n+ehqU+EzukjKyxmmSpOtAsX0CS46apRoisF3lni5Ar5o/FixX+PkLO+RuTvyZtZPPaqNFQVotFV6BS2VLTswZdmnw9sYtVhgR5yzYor"; // 商户私钥 注意：此处不是文件路径，一定要是文件内容
var public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoURPGE5fyvF43fKKHP2ip4t0r0Fag/1i9ba2Nir6FBPyMJFJ3W6OWTZEjGfXkgZaxxw1sYEKUoxsouBlj+K12XXt0mb6ZUb9Udfok6u9+WcQEjiOeB842Yp50xHeqGgdgmGdOg4teZZ4Fk1p2uJn4dRa1x7pD03cT7ozPatounj6KEMDJqOX8z5nBtn7xPkS0RYzF3u8GDOXShdRhkO6tG4AHqKC1sb3OZwToAzUz3ba/cu2a/UyO5wAPDgEE1D6JMMfNQTAFviVINkjFqf9U8EYH4LIQi825iMpDen/N70Vk7gtv0vqlOmb+S+XdA5ZTnQ06TGZyhJxN5fHxj7l/wIDAQAB"; // 支付宝公钥 注意：此处不是文件路径，一定要是文件内容

// 支付配置
const payConfig = {
    app_id: '2019051064471085', // appid
    private_key: private_key,
    public_key: public_key,
    notify_url: 'http://39.108.10.188:8095/payBack', // 通知地址
    return_url: 'http://39.108.10.188:8095/return', // 跳转地址
    dev: false // 设置为true 将启用开发环境的支付宝网关
}
// vip支付
var alipay = Pay.alipay(payConfig);
//数据库配置
const mysqlConfig = {
    host: '39.108.10.188',
    user: 'root',
    password: '123456',
    port: '3306',
    database: "wall",
    useConnectionPooling: true
}
var connection = mysql.createConnection(mysqlConfig);
// 允许访问静态目录
app.use(express.static(__dirname + '/views'));
// post请求需要
app.use(bodyParser.urlencoded({ extended: false }));

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

// 发邮件
app.get('/email', function (req, res, next) {
    var code = parseInt(randomNum(4));
    console.log("user-alias <" + config.user + ">")
    if (!req.query.email) {
        res.json({
            code: 0,
            msg: "email不能为空"
        })
        return;
    }
    smtpTransport.sendMail({
        from: "积分墙 <" + config.user + ">",//发件人邮箱
        to: req.query.email || null,//收件人邮箱，多个邮箱地址间用','隔开
        subject: req.query.subject || "积分墙验证码",//邮件主题
        // text: req.query.text || req.query.html//text和html两者只支持一种
        html: "您的验证码是: " + code,
        text: "您的验证码是: " + code
    }, function (Eerr, back) {
        console.log(Eerr)
        if (Eerr) {
            res.json({
                code: 0,
                msg: "邮箱发送失败"
            })
            console.log("发送失败")
            return;
        }
        connection = mysql.createConnection(mysqlConfig);
        console.log(back)
        var sql = "select * from register_code where user_name = '" + req.query.email + "'";
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
                var addSql = 'INSERT INTO register_code(user_name,code) VALUES(?,?)';
                var addSqlParams = [req.query.email, code];
                connection.query(addSql, addSqlParams, function (err, result2) {
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        res.json({
                            code: 0,
                            msg: "未知错误"
                        })
                        return;
                    }
                    console.log('--------------------------INSERT----------------------------');
                    res.json({
                        code: 1,
                        data: {
                            // userName:req.query.email,
                            // code:code,
                            type: 'registered',

                        },
                        msg: "成功"
                    })

                });
            } else {
                var modSql = 'UPDATE register_code SET code = ? WHERE user_name = ?';
                var modSqlParams = [code, req.query.email];
                connection.query(modSql, modSqlParams, function (err, result) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    res.json({
                        code: 1,
                        data: {
                            // userName:req.query.email,
                            // code:code,
                            type: 'registered',

                        },
                        msg: "成功"
                    })
                });
            }

        })
        // res.json(back) 
    });
});
app.post('/email/confirm', function (req, res, next) {
    console.log(req.body)
    connection = mysql.createConnection(mysqlConfig);
    var sql = "select * from register_code where user_name = '" + req.body.email + "' and code = '" + req.body.code + "'";
    //查
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "验证失败"
            })
            console.log('[UPDATE ERROR] - ', err.message);
            return;
        }
        console.log(userData);

        if (userData.length === 0) {
            res.json({
                code: 0,
                msg: "验证失败"
            })
        } else {
            res.json({
                code: 1,
                msg: "验证成功"
            })
        }
    })

})

app.post('/ios/udid', function (req, res, next) {
    console.log(req.body);
    res.json({
        code: 1,
        msg: "UDID"
    })

})
app.get("/rt", function (req, res) {
    res.type("html");
    res.render("index.ejs", {
        currentUser: 123
    });
    // res.render("index.ejs");
});
// 支付
app.post('/pay', function (req, res, next) {
    connection = mysql.createConnection(mysqlConfig);
    var payObj = {
        userid: req.body.id || null,
        money: req.body.money || 38,
        statuts: req.body.statuts || 0,
        viptype: req.body.viptype || 2, //默认是2
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
            subject: '积分墙'

        }

        const wapOrder = {
            out_trade_no: payObj.order_number,
            total_amount: payObj.money, // 单位 元
            subject: '积分墙'
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
            res.render("index.ejs", {
                data: {
                    money: req.query.total_amount,
                    userId: orderData.userid
                }
            });

        })

    } else {
        res.send('支付失败！！！' + JSON.stringify(req.query))
    }
})

// 订单查询
app.post('/order', (req, res) => {
    connection = mysql.createConnection(mysqlConfig);
    var sql = "select * from order_list where order_number = '" + req.body.order_number + "'";
    connection.query(sql, function (err, orderData) {
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

        } else {
            orderData[0].statuts = parseInt(orderData[0].statuts);
            res.json({
                code: 1,
                data: orderData[0],
                msg: "成功"
            })

        }
    })

})

// 支付宝回调
app.post('/payBack', (req, res) => {
    connection = mysql.createConnection(mysqlConfig);
    // console.log(req.body)
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
                userData = userData[0];
                // console.log(userData)
                var timestamp = Date.parse(new Date());
                timestamp = timestamp / 1000;

                var time = Date.parse(userData.vip_expiration_time);
                time = (time / 1000) - timestamp;
                if (time == null || !time || time <= 0 || time == NaN) {
                    if (orderData.viptype === 1) {
                        timestamp = timestampToTime(timestamp + (day * 365));
                    } else {
                        timestamp = timestampToTime(timestamp + (day * 30));

                    }
                } else {
                    if (orderData.viptype === 1) {
                        timestamp = timestampToTime(timestamp + (day * 365) + time)
                    } else {
                        timestamp = timestampToTime(timestamp + (day * 30) + time)
                    }
                }
                var modSql = 'UPDATE user_manage SET isvip = ? , vip_type = ? , vip_expiration_time = ?  WHERE id = ?';
                var modSqlParams = [1, orderData.viptype, timestamp, orderData.userid];
                //添加vip
                connection.query(modSql, modSqlParams, function (err, UPdata) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    console.log('--------------------------UPDATE----------------------------');
                    var modSql = 'UPDATE order_list SET order_status = ?  WHERE order_number = ?';
                    var modSqlParams = [1, req.body.out_trade_no];
                    //添加viporderlist
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
function getIPAdress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}
let server = app.listen(port, function () {
    if (ipaddress) {
        console.log(ipaddress + ':' + port + '服务器运行成功');
    } else {
        console.log('no networking, please open ' + ipaddress + ':' + port + ' in browser');
    }
});

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
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = (date.getDate() + 1 < 10 ? '0' + (date.getDate() + ' ') : date.getDate() + ' ');
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y + M + D//+h+m+s;
}


// 数据库连接(包含断开重连)
var conn;
function handleError() {
    conn = mysql.createConnection(mysqlConfig);

    //连接错误，2秒重试
    conn.connect(function (err) {
        if (err) {
            console.log("正在重新连接数据库......");
            setTimeout(handleError, 2000);
        }
    });

    conn.on('error', function (err) {
        console.log('db error', err);
        // 如果是连接断开，自动重新连接(直到链接成功)
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleError();
        } else {
            throw err;
        }
    });
}
handleError();

//随机数
function randomNum(len) {
    len = len || 4;
    var $chars = '0123456789';
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}


// 每天凌晨执行任务(清空验证码)(执行vip过期判断)
var rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [0, new schedule.Range(1, 6)];

rule.hour = 14;

rule.minute = 40;

var j = schedule.scheduleJob(rule, function () {
    connection = mysql.createConnection(mysqlConfig);
    //  代码捎候
    console.log("执行任务");
    var sql = 'truncate table register_code';
    //清空
    connection.query(sql, function (err, result2) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        console.log("已清空");


    })

    var sql2 = 'SELECT * FROM user_manage';
    //查
    connection.query(sql2, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        console.log(result.length);

        for (var i = 0; i < result.length; i++) {
            (function (i) {
                var timestamp = (Date.parse(result[i].vip_expiration_time)) / 1000;
                var todayTime = Date.parse(new Date()) / 1000;
                todayTime = timestampToTime(todayTime);
                todayTime = Date.parse(todayTime) / 1000;
                if (timestamp - todayTime < 0) {
                    var modSql = 'UPDATE user_manage SET isvip = ?, vip_type = ? , vip_expiration_time = ? WHERE id = ?';
                    var modSqlParams = [0, 0, null, result[i].id];
                    connection.query(modSql, modSqlParams, function (err, result) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);
                            return;
                        }
                        console.log('--------------------------UPDATE----------------------------');
                    });
                }
            }(i))
        }
    })
})

// 每天凌晨执行任务(vip过期判断)
var rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [0, new schedule.Range(1, 6)];

rule.hour = 0;

rule.minute = 01;

var j = schedule.scheduleJob(rule, function () {
    //  代码捎候
    console.log("执行任务");

})