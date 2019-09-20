var express = require('express');
var app = express();
var bodyParser = require('body-parser');//解析,用req.body获取post参数
var port = 8090;
var mysql = require('mysql');
var ipaddress = getIPAdress();//ip地址
var Pay = require('cn-pay');
var ejs = require("ejs");
var schedule = require("node-schedule");
var path = require("path");
var private_key = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD4+QaEXeXB6TiLO6jfMXH6YCYoob8H+ojO3KHIMLZMRCrv60mIVZzQLmR3ewi36Va6IAQ25LEZab57s8ZMOArzaco1RbZKrfJvIi2vPI9Aa/Q7TLM8iXofR9HNgoCRwesMczoKheyLtaTnjJBPlgN+HGMBqJS2KSRcBTK23Im0H76ofMZ/RBIRYE3dyV54Gk24Pac/O0H0AgjbRYmnHGkW2BnXchemLC6FbNVMfhSKeEZ0ksmhjwOQBClZ11ZVRw7UwlX8Gyjvt4HpRWM+expuXbNEs6D1lrGIRm/2QD+P3NKRYqo/j0Efl+cfh0BL39AF3M9zTFgW0JeSk5Dev0BNAgMBAAECggEBAMPzWsm7DSV85N/QaKyhQc+I9P9tregdqqcExt/EVvXXgOOrDwiaOP0wRiozTz1QDM4YfLinbStPKng5mYxLX3MMg/VBlKNaHECTadlNlIFjdalmSHsQyGjuIZXZbE9LjC8UUU4O8YlTwSHsY3f/3WfX96RKhiCIaPFzteJt2INGG2TQYJPtW99TRB36ZBUSPwfLMVbBA2ih4cOKRDsG42kkMDNZb5A+lplHTslioPUbkafPj+uFtcCcmmfloO7DIiHzqyRPTsvDy/0v714JTqGA+AGrnizrDbYU5awQrowYyv2IIPiqthS6WnIF0ed4Ay0XEodoJsumiMf7Xl5pnIECgYEA/dBCps9uKbr4S4P0Krx/rabXCysA6wpNWgXE82nkGWCEAxSNMWGU4MfOhBhOHwrgblFiiO+DJpPlN1ABniUp7WzZIgDfYi3WHpHW4hr+pfJQwaqHdkOChhjM3pktwE2+webONAXrGSDzhQhYz4GFM/iPbIGYcJ1kAPFij8zX8NkCgYEA+x4W9TNeokEWvDSOk3H1fYi5XqpDOQbIlVD3P1Fa3N1NHS0O2oG/EwRnTh+Nq/cpv2JfmkZ06spwFpCYMSXy61d73nnhnC2RdmUriedZXz+FlLLU1fElAvNDgqDMPtUhL756Boe5KqNMQuZxGy3s5AMqkRvvlxeGLSPXTFelYpUCgYBNJ4u7TX79bHqh6gDFJPvi+76PBImI6V7OKMbP/7Z5CF/Y19x70GADXHmoqgLFaPcEUfUUD0rc5UReZhG30zBFnjr7HSzKmYhnTon1vaL/KwPle0Mmbis1PEC6wfGobXm5U8IHCm2G+/9Kx1jH62VkgQCISXTfdti5eKcvc2OJMQKBgQCrPfqj3RL0jHRHhYOQko64u0rFfk/3DGQuRpdEa2MN6C+U7MwLP50gB8m2oZfHo/WpGBlfqBpEniXPjWzrXxiHWhITRYQPL5fZZ+ZH1SbB6BxcqZKwDhCSMXdhFewSEN7fowGtgFJJ/C+eE20f/rJjTrFxYN6CZz1NfPptifsy/QKBgGrE0q3FPxvXSMNQ8jANzgii2RQQaMfPhomxhj7zpd4H0OiZhlDNuTrzvbVCguM6veb9n+ehqU+EzukjKyxmmSpOtAsX0CS46apRoisF3lni5Ar5o/FixX+PkLO+RuTvyZtZPPaqNFQVotFV6BS2VLTswZdmnw9sYtVhgR5yzYor"; // 商户私钥 注意：此处不是文件路径，一定要是文件内容
var public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoURPGE5fyvF43fKKHP2ip4t0r0Fag/1i9ba2Nir6FBPyMJFJ3W6OWTZEjGfXkgZaxxw1sYEKUoxsouBlj+K12XXt0mb6ZUb9Udfok6u9+WcQEjiOeB842Yp50xHeqGgdgmGdOg4teZZ4Fk1p2uJn4dRa1x7pD03cT7ozPatounj6KEMDJqOX8z5nBtn7xPkS0RYzF3u8GDOXShdRhkO6tG4AHqKC1sb3OZwToAzUz3ba/cu2a/UyO5wAPDgEE1D6JMMfNQTAFviVINkjFqf9U8EYH4LIQi825iMpDen/N70Vk7gtv0vqlOmb+S+XdA5ZTnQ06TGZyhJxN5fHxj7l/wIDAQAB"; // 支付宝公钥 注意：此处不是文件路径，一定要是文件内容
var day = 86400;
// 支付配置
const payConfig = {
    app_id: '2019051064471085', // appid
    private_key: private_key,
    public_key: public_key,
    notify_url: 'http://39.108.10.188:8090/payBack', // 通知地址
    return_url: 'http://39.108.10.188:8090/return', // 跳转地址
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

app.get('/check', function (req, res, next) {
    connection = mysql.createConnection(mysqlConfig);
    var sql = "SELECT * FROM sign_list where takepart_time= '" + timestampToTime(new Date() / 1000 - day) + "' and user_id = " + req.query.userId;
    // console.log(sql)
    connection.query(sql, function (err, userData) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "数据错误"
            })
            return;
        }
        console.log(timestampToTime(new Date() / 1000))
        // console.log(userData)
        if (userData.length === 0) {
            res.json({
                code: 1,
                data: {
                    statut: 0
                },
                msg: "未参加签到"
            })
        } else if (userData[0].pay_status === 3) {
            res.json({
                code: 1,
                data: {
                    statut: 0
                },
                msg: "参加明日签到"
            })
        } else {
            res.json({
                code: 1,
                data: {
                    statut: function () {
                        if (new Date().getHours() > 8) {
                            return 0;
                        } else {
                            return 1;
                        }
                        // return userData[0].pay_status
                    }()
                },
                msg: function () {
                    var msg_ = "";
                    if (userData[0].pay_status === 0) {
                        msg_ = "今日未参加签到";
                    } else {
                        msg_ = "今日已参加签到";
                    }
                    return msg_;
                }()
            })
        }
    })
})
app.get('/checkIn/sign', function (req, res, next) {
    connection = mysql.createConnection(mysqlConfig);
    req.query.user_id = parseInt(req.query.user_id);
    console.log(req.query.user_id)
    var sql = "SELECT * FROM sign_list where user_id = " + req.query.user_id + " and takepart_time = '" + timestampToTime(new Date() / 1000 - day) + "'";
    console.log(sql)
    connection.query(sql, function (err, userData) {
        if (userData.length === 0) {
            res.json({
                code: 0,
                msg: "该用户未参加活动"
            })
            return false;
        }
        console.log(userData[0].sign_time)
        if (userData[0].sign_time) {
            res.json({
                code: 2,
                msg: "已成功签到 系统8：35之前发送奖励!"
            })
            return false;
        }

        if (new Date().getHours() === 8 && new Date().getMinutes() >= 30 && new Date().getMinutes() <= 35) {
            var modSql = 'UPDATE sign_list SET sign_time = ? WHERE user_id = ? and takepart_time = ?';
            var modSqlParams = [timestampToTime(new Date() / 1000, true), req.query.user_id, timestampToTime(new Date() / 1000 - day)];

            connection.query(modSql, modSqlParams, function (err, UPdata) {
                if (err) {
                    console.log('[UPDATE ERROR1] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "数据错误"
                    })
                    return;
                }
                console.log("是是是")
                var sql = "SELECT * FROM user_manage where id = " + req.query.user_id;
                console.log(sql)
                connection.query(sql, function (err, ss) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    var modSql2 = 'UPDATE user_manage SET series_days = ? WHERE id = ?';
                    var modSqlParams2 = [ss[0].series_days++, req.query.user_id];
                    //添加vip
                    connection.query(modSql2, modSqlParams2, function (err, UPdata) {
                        if (err) {
                            console.log('[UPDATE ERROR2] - ', err.message);
                            res.json({
                                code: 0,
                                msg: "数据错误"
                            })
                            return;
                        }
                        res.json({
                            code: 1,
                            msg: "签到成功"
                        })

                    })
                })

            })
        } else {
            res.json({
                code: 2,
                msg: "抱歉！非签到时间不能签到!"
            })
        }

    })
})
// 签到奖金
app.get('/checkIn/InitialMoney', function (req, res, next) {
    connection = mysql.createConnection(mysqlConfig);
    var sql = 'SELECT * FROM checkInMoney';
    connection.query(sql, function (err, userData) {
        console.log(userData)
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "数据错误"
            })
            return;
        }
        if (req.query.money) {
            var modSql = 'UPDATE checkInMoney SET InitialMoney = ? WHERE id = ?';
            var modSqlParams = [parseInt(req.query.money), 1];
            connection.query(modSql, modSqlParams, function (err, UPdata) {
                if (err) {
                    console.log('[UPDATE ERROR] - ', err.message);
                    res.json({
                        code: 2,
                        msg: "修改失败"
                    })
                    return;
                }
                res.json({
                    code: 3,
                    msg: "修改成功"
                })
            })
        } else {
            res.json({
                code: 1,
                data: {
                    money: userData[0].InitialMoney
                },
                msg: "成功"
            })
        }
    })
})

// 签到数据
app.get('/checkIn/data', function (req, res, next) {
    connection = mysql.createConnection(mysqlConfig);
    var sql = 'SELECT * FROM checkInMoney';
    connection.query(sql, function (err, userData) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "数据错误"
            })
            return false;
        }
        // 奖金池
        var money_pool = userData[0].InitialMoney + userData[0].divideMoney || 0;
        var all_money = 0;
        var today_money = 0;
        var sign_success = 0;
        var sign_fail = 0;
        var series_days = 0;
        var user_number = userData[0].userNum || 0;
        // var sql = 'SELECT * FROM sign_list where user_id = '+req.query.id || null; 
        var sql = 'SELECT * FROM sign_list';
        connection.query(sql, function (err, sign_list) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                res.json({
                    code: 0,
                    msg: "数据库错误"
                })
                return false;
            }
            for (var i = 0; i < sign_list.length; i++) {
                (function (i) {
                    var sign_time = Date.parse(sign_list[i].sign_time) / 1000;

                    sign_time = timestampToTime(sign_time);
                    var takepart_time = Date.parse(sign_list[i].takepart_time) / 1000;

                    takepart_time = timestampToTime(takepart_time);
                    if (sign_list[i].user_id == req.query.id) {
                        var cash = parseFloat(sign_list[i].money) || 0;
                        // console.log(sign_list[i].money)
                        // 累计签到奖励
                        all_money += cash;


                        // console.log(Date.parse(sign_time))
                        // console.log(Date.parse(timestampToTime(new Date()/1000)))
                        if (Date.parse(sign_time) === Date.parse(timestampToTime(new Date() / 1000))) {
                            // 当天签到奖励
                            today_money += cash;
                        }

                    }
                    // if((Date.parse(takepart_time)===Date.parse(timestampToTime(new Date()/1000-day)) && sign_list[i].pay_status===1) || (Date.parse(takepart_time)===Date.parse(timestampToTime(new Date()/1000-day)) && sign_list[i].pay_status===3)){

                    //     user_number++;

                    // }

                    if (sign_list[i].pay_status != 0) {
                        if (Date.parse(sign_time) === Date.parse(timestampToTime(new Date() / 1000))) {
                            if (sign_list[i].pay_status === 3) {

                                sign_success++;
                            } else {
                                sign_fail++;
                            }
                        }
                        if (Date.parse(takepart_time) === Date.parse(timestampToTime(new Date() / 1000 - day)) && sign_list[i].pay_status === 1) {
                            sign_fail++;
                        }
                    }

                }(i))



            }
            var sql = 'SELECT * FROM user_manage where id= ' + req.query.id;
            connection.query(sql, function (err, user_manage) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "数据库错误"
                    })
                    return false;
                }
                series_days = user_manage[0].series_days || 0;

                res.json({
                    code: 1,
                    data: {
                        money_pool: money_pool,
                        all_money: all_money,
                        today_money: today_money,
                        sign_success: sign_success,
                        sign_fail: sign_fail,
                        series_days: series_days,
                        user_number: user_number
                    },
                    msg: "成功"
                })

            })
        })
        // res.json({
        //     code: 0,
        //     data:{ 
        //         money_pool:money_pool
        //     },
        //     msg:"成功"
        // }) 
        // return;
    })
})


// 支付
app.post('/checkPay', function (req, res, next) {
    connection = mysql.createConnection(mysqlConfig);
    var payObj = {
        userid: req.body.id || null,
        money: req.body.money || 1,
        order_time: function () {
            var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            return timestampToTime(timestamp);
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

    var sql2 = "select * from sign_list where takepart_time = '" + timestampToTime(new Date() / 1000) + "' and user_id = " + payObj.userid;
    //查
    connection.query(sql2, function (err, userData) {
        console.log(userData)
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "参数错误"
            })
            return;
        }

        if (userData.length === 0) {
            var addSql2 = 'INSERT INTO sign_list(user_id,takepart_time,pay_status) VALUES(?,?,?)';
            var addSqlParams2 = [payObj.userid, timestampToTime(new Date() / 1000), 0];

            connection.query(addSql2, addSqlParams2, function (err, backData) {
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        err: err.message,
                        msg: "参加失败"
                    })
                    return;
                }
            })
        } else if (userData[0].pay_status === 0) {

        } else {
            res.json({
                code: 2,
                msg: "不允许重复参加签到"
            })
            return
        }
        // console.log(userData)

        var addSql = 'INSERT INTO order_list(userid,money,order_time,order_number,pay_scene) VALUES(?,?,?,?,?)';
        var addSqlParams = [payObj.userid, payObj.money, payObj.order_time, payObj.order_number, 0];

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
                subject: '积分墙签到'

            }

            const wapOrder = {
                out_trade_no: payObj.order_number,
                total_amount: payObj.money, // 单位 元
                subject: '积分墙签到'
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
    })
});
// 支付宝返回
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
                var modSql = 'UPDATE sign_list SET pay_status = ? , takepart_time = ? WHERE user_id = ? and takepart_time = ?';
                var modSqlParams = [1, timestampToTime(new Date() / 1000), orderData.userid, timestampToTime(new Date() / 1000)];
                //添加vip
                connection.query(modSql, modSqlParams, function (err, UPdata) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    console.log('--------------------------UPDATE----------------------------');
                    var modSql = 'UPDATE order_list SET order_status = ?  WHERE order_number = ?';
                    var modSqlParams = [1, req.body.out_trade_no];

                    connection.query(modSql, modSqlParams, function (err, hh) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);
                            return;
                        }
                        var s = 'select * from checkInMoney';

                        connection.query(s, function (err, sda) {
                            sda = sda[0];
                            var modSql = 'UPDATE checkInMoney SET divideMoney = ? , userNum = ?';
                            // 奖金池加一元
                            var modSqlParams = [sda.divideMoney += 1, sda.userNum += 1];
                            //添加vip
                            connection.query(modSql, modSqlParams, function (err, UPdata) {
                                if (err) {
                                    console.log('[UPDATE ERROR] - ', err.message);
                                    return;
                                }
                                console.log("支付成功回调")
                                if (alipay.verify(req.body)) { //验签
                                    console.log('支付宝异步验签成功：')
                                    res.send('SUCCESS')
                                } else {
                                    console.log('支付宝异步验签失败：')
                                    res.send('ERROR')
                                }
                                console.log('--------------------------UPDATE----------------------------');

                            })
                        })

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

// total=数字 nums=要随机拆分多少个数字
function randomDivide(total, nums) {
    rest = total;
    const result = Array.apply(null, { length: nums })
        .map((n, i) => nums - i)
        .map(n => {
            const v = 1 + (Math.random() * (rest / n * 2 - 1));
            rest -= v;
            return v;
        });
    result[nums - 1] += rest;
    return result;
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




// 每天8:35执行任务(签到奖励)
var rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [0, new schedule.Range(1, 6)];

rule.hour = 8;

rule.minute = 35;

var j = schedule.scheduleJob(rule, function () {
    connection = mysql.createConnection(mysqlConfig);
    //  代码捎候
    console.log("执行任务");
    var sql = 'SELECT * FROM sign_list';
    console.log(sql)
    connection.query(sql, function (err, result2) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        var sql22 = 'SELECT * FROM sign_list where takepart_time = "' + timestampToTime(new Date() / 1000 - day) + '" and pay_status = 1';
        connection.query(sql22, function (err, result3) {
            // console.log(result2)
            var checkInMoneys = 'SELECT * FROM checkInMoney';
            connection.query(checkInMoneys, function (err, checkInMoney) {
                console.log(result3)
                checkInMoney = checkInMoney[0];
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "数据错误"
                    })
                    return;
                }
                var allMoney = randomDivide(checkInMoney.divideMoney, result3.length)
                for (var i = 0; i < result3.length; i++) {
                    (function (i) {
                        var sign_time = Date.parse(result3[i].sign_time) / 1000;
                        // console.log(sign_time)
                        sign_time = timestampToTime(sign_time);
                        // 签到奖励

                        if (Date.parse(sign_time) === Date.parse(timestampToTime(new Date() / 1000)) && result3[i].pay_status === 1) {
                            console.log("okokok")
                            var allMoneyI = parseFloat(allMoney[i]).toFixed(2)
                            var modSql5 = 'UPDATE sign_list SET money = ? , pay_status = ? WHERE user_id = ? and takepart_time = ?';
                            var modSqlParams5 = [allMoneyI, 3, result3[i].user_id, timestampToTime(new Date() / 1000 - day)];
                            // console.log(parseInt(result3[i].money)+=)
                            connection.query(modSql5, modSqlParams5, function (err, ai) {
                                if (err) {
                                    console.log('[UPDATE ERROR] - ', err.message);
                                    return;
                                }

                                console.log("奖金已发出")
                            })

                            var sql2 = 'SELECT * FROM user_manage where id = ' + result3[i].user_id;
                            connection.query(sql2, function (err, re2) {
                                if (err) {
                                    console.log('[SELECT ERROR] - ', err.message);
                                    return;
                                }
                                var modSql = 'UPDATE user_manage SET cash_remain = ? WHERE id = ?';

                                if (!re2[0].cash_remain && re2[0].cash_remain == NaN) {
                                    re2[0].cash_remain = 0;
                                } else {
                                    re2[0].cash_remain = parseFloat(re2[0].cash_remain)
                                }
                                console.log("-----");

                                var modSqlParams = [re2[0].cash_remain += parseFloat(allMoney[i]), result3[i].user_id];
                                connection.query(modSql, modSqlParams, function (err, UPdata) {
                                    if (err) {
                                        console.log('[UPDATE ERROR] - ', err.message);
                                        return;
                                    }

                                    var addSql = 'INSERT INTO pay_in_out(user_id,s_date,money,money_type,info) VALUES(?,?,?,?,?)';
                                    var addSqlParams = [result3[i].user_id, timestampToTime(new Date() / 1000, true), parseFloat(allMoney[i]), "收入", "签到收入" + allMoney[i] + "元"];

                                    connection.query(addSql, addSqlParams, function (err, backData) {
                                        if (err) {
                                            console.log('[UPDATE ERROR] - ', err.message);
                                            return;
                                        }

                                    })
                                    // console.log("奖金已发出")
                                })

                                var modSql = 'UPDATE user_manage SET series_days = ? WHERE id = ?';
                                var series_days2 = parseInt(re2[0].series_days);
                                console.log(series_days2 += 1)
                                var modSqlParams = [series_days2++, result3[i].user_id];
                                connection.query(modSql, modSqlParams, function (err, series_days) {
                                    if (err) {
                                        console.log('[UPDATE ERROR] - ', err.message);
                                        return;
                                    }
                                })
                                console.log("连续签到")

                            })
                        }

                    }(i))
                }

                for (var i = 0; i < result2.length; i++) {
                    (function (i) {
                        // 连续打卡
                        var sql2 = 'SELECT * FROM sign_list where takepart_time = "' + timestampToTime((new Date() / 1000) - (day * 2)) + '" and user_id = ' + result2[i].user_id + " and pay_status = 3";
                        console.log(sql2)
                        connection.query(sql2, function (err, re) {
                            if (err) {
                                console.log('[SELECT ERROR] - ', err.message);
                                return;
                            }
                            console.log(re.length)
                            if (re.length === 0) {
                                var modSql = 'UPDATE user_manage SET series_days = ? WHERE id = ?';
                                var modSqlParams = [0, result2[i].user_id];
                                connection.query(modSql, modSqlParams, function (err, UPdata) {
                                    if (err) {
                                        console.log('[UPDATE ERROR] - ', err.message);
                                        return;
                                    }
                                })
                                console.log("连续签到打断")
                            }
                        })
                    }(i))
                }


            })
        })

    })


})


// 每天执行任务(重置签到数据)
var rule2 = new schedule.RecurrenceRule();
connection = mysql.createConnection(mysqlConfig);
rule2.dayOfWeek = [0, new schedule.Range(1, 6)];

rule2.hour = 8;

rule2.minute = 36;

var j = schedule.scheduleJob(rule2, function () {

    //  代码捎候
    var modSql = 'UPDATE checkInMoney SET divideMoney = ? , userNum = ? WHERE id = ?';
    var modSqlParams = [0, 0, 1];
    connection.query(modSql, modSqlParams, function (err, UPdata) {
        if (err) {
            console.log('[UPDATE ERROR] - ', err.message);
            return;
        }
        console.log("奖金池已重置")
    })

    var sql = 'SELECT * FROM user_manage';
    console.log(sql)
    connection.query(sql, function (err, result2) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        var sql22 = 'SELECT * FROM sign_list where takepart_time = "' + timestampToTime(new Date() / 1000 - day) + '" and pay_status = 1';
        connection.query(sql22, function (err, result3) {
            // console.log(result2)
            var checkInMoneys = 'SELECT * FROM checkInMoney';
            connection.query(checkInMoneys, function (err, checkInMoney) {
                console.log(result3)
                checkInMoney = checkInMoney[0];
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "数据错误"
                    })
                    return;
                }
                var allMoney = randomDivide(checkInMoney.divideMoney, result3.length)
                for (var i = 0; i < result3.length; i++) {
                    (function (i) {
                        var sign_time = Date.parse(result3[i].sign_time) / 1000;
                        // console.log(sign_time)
                        sign_time = timestampToTime(sign_time);
                        // 签到奖励

                        if (Date.parse(sign_time) === Date.parse(timestampToTime(new Date() / 1000)) && result3[i].pay_status === 1) {
                            console.log("okokok")
                            var allMoneyI = parseFloat(allMoney[i]).toFixed(2)
                            var modSql5 = 'UPDATE sign_list SET money = ? , pay_status = ? WHERE user_id = ? and takepart_time = ?';
                            var modSqlParams5 = [allMoneyI, 3, result3[i].user_id, timestampToTime(new Date() / 1000 - day)];
                            // console.log(parseInt(result3[i].money)+=)
                            connection.query(modSql5, modSqlParams5, function (err, ai) {
                                if (err) {
                                    console.log('[UPDATE ERROR] - ', err.message);
                                    return;
                                }

                                console.log("奖金已发出")
                            })

                            var sql2 = 'SELECT * FROM user_manage where id = ' + result3[i].user_id;
                            connection.query(sql2, function (err, re2) {
                                if (err) {
                                    console.log('[SELECT ERROR] - ', err.message);
                                    return;
                                }
                                var modSql = 'UPDATE user_manage SET cash_remain = ? WHERE id = ?';

                                if (!re2[0].cash_remain && re2[0].cash_remain == NaN) {
                                    re2[0].cash_remain = 0;
                                } else {
                                    re2[0].cash_remain = parseFloat(re2[0].cash_remain)
                                }
                                console.log("-----");

                                var modSqlParams = [re2[0].cash_remain += parseFloat(allMoney[i]), result3[i].user_id];
                                connection.query(modSql, modSqlParams, function (err, UPdata) {
                                    if (err) {
                                        console.log('[UPDATE ERROR] - ', err.message);
                                        return;
                                    }

                                    var addSql = 'INSERT INTO pay_in_out(user_id,s_date,money,money_type,info) VALUES(?,?,?,?,?)';
                                    var addSqlParams = [result3[i].user_id, timestampToTime(new Date() / 1000, true), parseFloat(allMoney[i]), "收入", "签到收入" + allMoney[i] + "元"];

                                    connection.query(addSql, addSqlParams, function (err, backData) {
                                        if (err) {
                                            console.log('[UPDATE ERROR] - ', err.message);
                                            return;
                                        }

                                    })
                                    // console.log("奖金已发出")
                                })

                                var modSql = 'UPDATE user_manage SET series_days = ? WHERE id = ?';
                                var series_days2 = parseInt(re2[0].series_days);
                                console.log(series_days2 += 1)
                                var modSqlParams = [series_days2++, result3[i].user_id];
                                connection.query(modSql, modSqlParams, function (err, series_days) {
                                    if (err) {
                                        console.log('[UPDATE ERROR] - ', err.message);
                                        return;
                                    }
                                })
                                console.log("连续签到")

                            })
                        }


                    }(i))
                }
            })
        })

        for (var i = 0; i < result2.length; i++) {
            (function (i) {
                // 连续打卡
                var sql2 = 'SELECT * FROM sign_list where takepart_time = "' + timestampToTime((new Date() / 1000) - (day * 2)) + '" and user_id = ' + result2[i].id + " and pay_status = 3";
                console.log(sql2)
                connection.query(sql2, function (err, re) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        return;
                    }
                    console.log(re.length)
                    if (re.length === 0) {
                        var modSql = 'UPDATE user_manage SET series_days = ? WHERE id = ?';
                        var modSqlParams = [0, result2[i].id];
                        connection.query(modSql, modSqlParams, function (err, UPdata) {
                            if (err) {
                                console.log('[UPDATE ERROR] - ', err.message);
                                return;
                            }
                        })
                        console.log("连续签到打断")
                    }
                })
            }(i))
        }

    })
})

