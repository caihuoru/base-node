var express = require('express');
var querystring = require("querystring");
var app = express();
var request = require('request');//解析,用req.body获取post参数
var port = 8092;
var ipaddress = getIPAdress();//ip地址
var mysql = require('mysql');
var schedule = require("node-schedule");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');//token
var path = require("path");
var ejs = require("ejs");
app.disable('etag');//解决304
var Pay = require('cn-pay');
var system = require('./drone-system');
app.use(express.static(__dirname + '/views'));
var day = 86400;
// ejs模板
app.locals.appName = "WRJ";
app.set("view engine", "jade");
app.set("views", path.resolve(__dirname, "views"));
app.engine("html", ejs.renderFile);
app.use(function (req, res, next) {
    res.locals.userAgent = req.headers["user-agent"];
    next();
});
var app_id = '2019082666428761'; // appid
var private_key = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCQb1/+m2adY1XH1j1msE8PGdTgCh/l01KdncO5uECXf6xVRf9EyCJ/hq5MwT0yHj0P1IXUgb94nRwJZClUgLZc5AcDBb4lRmqDUDtDOCat9TQXXqWnMbm1Yh9x7uvS3+4yxmdtdo0wR2wOFwzK7igM8hU7I0hA3cO/TkfWR84Or5vSR4joS3w50ulI78rCHvqV6cZdXVG8ekrLR4AZ68SiZ/zWhEazPTamKQEMU+E4FXIPtkSzH0Vl0OSsB/HdX/KncPHlZ87s+y0VAEMmXrSteUXDf/vPe+ScbeIZy0NntGybt81M7btmZrx3F2x55xs+wZwca8fC4gQzFV7w+aqzAgMBAAECggEANqfuy4pC6owMifKoiZNuV2iPBbjPGUk+miZ5Sm5PAwVtUVeLoZuacmekzabSYYTP1o21lxUCP8I0OdmNSkzqtXwUqzAhJDnhVI+n3WgCOxHvBGjshrhqbhkTjSm8U7Apk01BFksmYn6khTBzxtcYkM2K+zX+wY0p5drZlFzXvPZk5r59pBbSTQSBs8u2/4ritDwClcz3a+BfElVVvQQvG+Wsod4z7KR5L39ohV3leezpNZdKp7p/1xS1dm7Lc4FioFNfKMwFT8JoP3UFTcG7jf24TJkoGFYjs/KUGf2XkVfSvQxYdZOoTsZ3fNEIOgq6uK0WcJYq/U5n0036VISzAQKBgQDUBbb2wqudoDBZIWWHwPcgKT7a7z0GLU6D8tGwpBr/fUkVVk2fwZrDDdy+FhX+lGU8EBRxIe+72xGtebnO3SyXk6LHQiDJeiXPV4F+pjdPBJunWCircO4yKfPynLqstSpnypW5iyDEYFnWn1Q12VKZBO9hCZaDw/c2P2m1wj9a7QKBgQCuZM704wS3lRr6mQhVYulmKPb9FXBtU3ejTtXZ11LKwnhVa58jsaFmgZUD0iubCzhFf3Y4p+y75l1Phn5YKLKhv60jvZZ7v2N8xXN8yrvyNvlNDa35pO4xL9n57do8COy+PiYmPDmps/pVyc0SLW6jORR4NQ51A0eSeeMDqkdIHwKBgDzyc5jVdu21uZA1iHEQqDlHgfj/YoRfC73kVCC528Trp9GJYID271z4pCbERIhM8hjk6mtm/Pn8TEWYwy/S5lmgJ9+tg61G/o1usxvL/gQp5/Cf5/j4WpBy/NwV75dr8IerdYTDmKS6qbiHTna4RQUVpRY44lp4P50Jd4K3Fu01AoGAZuEljiYW9E5MGiYJWoX9dr0X5/mr13L0Ey1Az0BNoTvUTWAuA5qYwqYTSKvF+bNGwQkOryGxcK/XwEBxbISlzPIMrBb+HYaspEC/fpEDC0MPEzvMtIdt1SqLhvugUOZa82gqjUfeJJT+S3m/NsgCitvzjW6PVsxWfrzVBaaAYrUCgYEAlsx18ab+WZHY9lx62tSfG6daSHtRaH0h3a1WxnTPbqcPNg5yulBVwwRcyLBOR5xQdSWB+kE8CZuhtosNhx4aKHQ1ZmIA1xQxrrk/5OwiwvIbEqy+V9jU3RzeuKj7qAHGlloDYIpLy6Z4Ufw0T3a0JEDxlZ3UROhUEvEEKJJNnpg="; // 商户私钥 注意：此处不是文件路径，一定要是文件内容
var public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkG9f/ptmnWNVx9Y9ZrBPDxnU4Aof5dNSnZ3DubhAl3+sVUX/RMgif4auTME9Mh49D9SF1IG/eJ0cCWQpVIC2XOQHAwW+JUZqg1A7QzgmrfU0F16lpzG5tWIfce7r0t/uMsZnbXaNMEdsDhcMyu4oDPIVOyNIQN3Dv05H1kfODq+b0keI6Et8OdLpSO/Kwh76lenGXV1RvHpKy0eAGevEomf81oRGsz02pikBDFPhOBVyD7ZEsx9FZdDkrAfx3V/yp3Dx5WfO7PstFQBDJl60rXlFw3/7z3vknG3iGctDZ7Rsm7fNTO27Zma8dxdseecbPsGcHGvHwuIEMxVe8PmqswIDAQAB"; // 支付宝公钥 注意：此处不是文件路径，一定要是文件内容

// 支付配置
const payConfig = {
    app_id: app_id, // appid
    private_key: private_key,
    public_key: public_key,
    notify_url: 'http://39.108.10.188:8092/payBack', // 通知地址
    return_url: 'http://39.108.10.188:8092/return', // 跳转地址
    dev: false // 设置为true 将启用开发环境的支付宝网关
}
// 支付宝开通vip
const alipayVip_ = {
    app_id: app_id, // appid
    private_key: private_key,
    public_key: public_key,
    notify_url: 'http://39.108.10.188:8092/vipPayBack', // 通知地址
    return_url: 'http://39.108.10.188:8092/vipReturn', // 跳转地址
    dev: false // 设置为true 将启用开发环境的支付宝网关
}
// 微信
const wechatConfig = {
    // app_id: 'wxa1a88f5371e0cc55', // 公众号appid
    appid: 'wxa1a88f5371e0cc55', // app的appid
    mch_id: '1549453351', // 商户Id
    key: '437D1CCAA370A1FC86650AEF91195BF4', // 商户密钥
    notify_url: 'http://39.108.10.188:8080/payBack', // 通知地址
    return_url: 'http://39.108.10.188:8080/return', // 跳转地址
}
const wechat = Pay.wechat(wechatConfig)
const alipay = Pay.alipay(payConfig);
const alipayVip = Pay.alipay(alipayVip_);
// 数据库配置
const config = {
    host: '39.108.10.188',
    user: 'root',
    password: '123456',
    port: '3306',
    database: "drone",
    useConnectionPooling: true
}
var connection = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    database: config.database
});

//邮箱配置
const emailConfig = {
    service: "qq",
    user: '3300729997@qq.com',
    pass: 'qfjjgjwvrqswcjej'//注：此处为授权码，并非邮箱密码
}
const smtpTransport = nodemailer.createTransport({
    host: "smtp.163.com",
    secureConnection: true,
    port: 587,
    service: emailConfig.service,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    },
    tls: { ciphers: 'SSLv3' }
});



app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Auth, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    if (req.method == "OPTIONS") {
        res.sendStatus(200);/*让options请求快速返回*/
    } else {
        next();
    }
});
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
        } else {
            postData = querystring.parse(postData)
        }
        req.body = postData;
        next();
    })
});
var day = 86400;



// 管理系统新区
system(app, connection);



// 打酱油
app.get('/', function (req, res, next) {
    res.json("isok")
});

app.post('/login', (req, res) => {
    console.log(req.body)
    //要生成 token 的主题信息
    if (!req.body.passWord) {
        res.json({
            code: 0,
            msg: "密码不能为空"
        })
        return false;
    }
    var Identification = req.body.email || req.body.phone;
    if (!Identification) {
        res.json({
            code: 0,
            msg: "用户不能为空"
        })
        return false;
    }
    let secret = 'wurenji';
    let user = {
        userName: Identification
    }
    let token_ = jwt.sign(user, secret, {
        'expiresIn': 60 * 60 * 12 // 设置过期时间, 12 小时
    })
    var sql = "select * from wrj_user where Identification = '" + Identification + "' and passWord = '" + req.body.passWord + "'";
    //查
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "账号密码输入不规范"
            })
            return;
        }
        console.log(result)
        if (result.length === 0) {
            var sql = "select * from wrj_user where Identification = '" + Identification + "'"
            connection.query(sql, function (err, more) {
                if (more.length === 0) {
                    res.json({
                        code: 0,
                        msg: "用户不存在"
                    })
                } else {
                    res.json({
                        code: 0,
                        msg: "密码错误"
                    })
                }
            })

        } else {
            var modSql = 'UPDATE wrj_user SET token = ? WHERE Identification = ? and passWord= ?';
            var modSqlParams = [token_, Identification, req.body.passWord];
            //添加vip
            connection.query(modSql, modSqlParams, function (err, UPdata) {
                if (err) {
                    console.log('[UPDATE ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "token异常"
                    })
                    return;
                }
                res.json({
                    code: 1,
                    data: {
                        use_id: result[0].id,
                        userName: result[0].name,
                        isVip: result[0].isVip,
                        expiretime: result[0].expiretime,
                        icon: result[0].icon,
                        token: token_,
                        sex: result[0].sex,
                        type: 'login',
                        money: result[0].money
                    },
                    msg: "登录成功"
                })
            })

        }
    })
})
//注册
app.post('/registered', function (req, res, next) {
    console.log(req.body)
    if (!req.body.passWord) {
        res.json({
            code: 0,
            msg: "密码不能为空"
        })
        return false;
    }
    var Identification = req.body.email || req.body.phone;
    if (!Identification) {
        res.json({
            code: 0,
            msg: "用户不能为空"
        })
        return false;
    }
    var sql = "select * from wrj_user where Identification = '" + Identification + "'";
    //查
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "账号密码输入不规范"
            })
            return;
        }
        console.log(result)
        if (result.length === 0) {
            //这是加密的 key（密钥）
            let secret = 'wurenji';
            let user = {
                userName: Identification
            }
            let token_ = jwt.sign(user, secret, {
                'expiresIn': 60 * 60 * 12 // 设置过期时间, 12 小时
            })
            var addSql = 'INSERT INTO wrj_user(Identification,name,passWord,token) VALUES(?,?,?,?)';
            var addSqlParams = [Identification, Identification, req.body.passWord, token_];
            //增
            connection.query(addSql, addSqlParams, function (err, result2) {
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "注册失败"
                    })
                    return;
                }
                console.log('INSERT');
                var sql = "select * from wrj_user where Identification = '" + Identification + "'";
                connection.query(sql, function (err, result) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        res.json({
                            code: 0,
                            msg: "账号密码输入不规范"
                        })
                        return;
                    }
                    res.json({
                        code: 1,
                        data: {
                            use_id: result[0].id,
                            userName: result[0].name,
                            isVip: result[0].isVip,
                            expiretime: result[0].expiretime,
                            icon: result[0].icon,
                            sex: result[0].sex,
                            token: token_,
                            type: 'registered',
                            money: result[0].money

                        },
                        msg: "注册成功"
                    })
                })

            });

        } else {
            res.json({
                code: 0,
                msg: "用户已存在"
            })
        }
    });
})
// 单独的token验证
app.post('/verifytoken', (req, res) => {
    let secret = 'wurenji';
    let token = req.headers['auth'];
    if (!token) {
        res.json({ code: 0, status: false, message: 'token不能为空' });
        return false;
    }
    if (req.body.manage) {
        var sql = "select * from wrj_manage where token = '" + token + "'";
    } else {
        var sql = "select * from wrj_manage where token = '" + token + "'";
    }
    //查
    connection.query(sql, function (err, result) {
        if (err) {
            res.json({
                code: 0,
                msg: "无效token"
            })
            return;
        }
        if (result.length === 0) {
            res.json({
                code: 0,
                msg: "无效token"
            })
            return;
        } else {
            var sql = "select * from wrj_manage where token = '" + token + "'";
            connection.query(sql, function (err, result) {
                if (result.length > 0) {
                    jwt.verify(result[0].token, secret, (error, result2) => {
                        if (error) {
                            res.json({ code: 0, status: false });
                        } else {
                            res.json({ code: 1, status: true, data: result2, power: result[0].power });
                        }
                    })
                } else {
                    res.json({ code: 0, status: false });
                }

            })

        }
    })
})
// 用户信息查询&token验证
app.post('/user/data', (req, res) => {
    //这是加密的 key（密钥），和生成 token 时的必须一样
    let secret = 'wurenji';
    let token = req.headers['auth'];
    if (!token) {
        res.json({ code: 0, status: false, message: 'token不能为空' });
        return false;
    }
    if (req.body.manage) {
        var sql = "select * from wrj_manage where token = '" + token + "'";
    } else {
        var sql = "select * from wrj_user where token = '" + token + "'";
    }
    //查
    connection.query(sql, function (err, result) {
        if (err) {
            res.json({
                code: 0,
                msg: "无效token"
            })
            return;
        }
        if (result.length === 0) {
            res.json({
                code: 0,
                msg: "无效token"
            })
            return;
        } else {
            jwt.verify(result[0].token, secret, (error, result2) => {
                if (error) {
                    res.json({ code: 0, status: false });
                } else {
                    result2.use_id = result[0].id;
                    result2.userName = result[0].name;
                    result2.sex = result[0].sex;
                    result2.isVip = result[0].isVip;
                    result2.expiretime = result[0].expiretime;
                    result2.icon = result[0].icon;
                    result2.money = result[0].money;
                    res.json({ code: 1, status: true, data: result2 });
                }
            })
        }
    })

})

// 发邮件
app.get('/email', function (req, res, next) {
    var code = parseInt(randomNum(4));
    if (!req.query.email) {
        res.json({
            code: 0,
            msg: "email不能为空"
        })
        return;
    }
    smtpTransport.sendMail({
        from: "无人机 <" + emailConfig.user + ">",//发件人邮箱
        to: req.query.email || null,//收件人邮箱，多个邮箱地址间用','隔开
        subject: req.query.subject || "无人机验证码",//邮件主题
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
        console.log(back)
        var sql = "select * from wrj_register_code where user_name = '" + req.query.email + "'";
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
                var addSql = 'INSERT INTO wrj_register_code(user_name,code) VALUES(?,?)';
                var addSqlParams = [req.query.email, code];
                connection.query(addSql, addSqlParams, function (err, result2) {
                    if (err) {
                        res.json({
                            code: 0,
                            msg: "未知错误"
                        })
                        return;
                    }
                    console.log('--------------------------INSERT----------------------------');
                    res.json({
                        code: 1,
                        msg: "成功"
                    })

                });
            } else {
                var modSql = 'UPDATE wrj_register_code SET code = ? WHERE user_name = ?';
                var modSqlParams = [code, req.query.email];
                connection.query(modSql, modSqlParams, function (err, result) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    res.json({
                        code: 1,
                        msg: "成功"
                    })
                });
            }

        })
        // res.json(back) 
    });
});
// 邮箱验证
app.post('/email/confirm', function (req, res, next) {
    console.log(req.body)
    var sql = "select * from wrj_register_code where user_name = '" + req.body.email + "' and code = '" + req.body.code + "'";
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
// 编辑新闻
app.get('/edit/news', function (req, res, next) {
    var addSql = 'UPDATE wrj_news SET title = ?, icon = ?, content = ?, region = ?, type = ?, hot = ?  WHERE id = ?';
    var addSqlParams = [req.query.title, req.query.icon, req.query.content, req.query.region, req.query.type, parseInt(req.query.hot), parseInt(req.query.id)];
    connection.query(addSql, addSqlParams, function (err, result2) {
        if (err) {
            console.log(err)
            res.json({
                code: 0,
                msg: "未知错误"
            })
            return;
        }
        console.log('--------------------------更新----------------------------');
        res.json({
            code: 1,
            msg: "成功"
        })

    });
})
// 添加新闻
app.get('/add/news', function (req, res, next) {
    var addSql = 'INSERT INTO wrj_news(title,icon,content,region,type,hot,time) VALUES(?,?,?,?,?,?,?)';
    var addSqlParams = [req.query.title, req.query.icon, req.query.content, req.query.region, req.query.type, 0, Date.parse(new Date())];
    connection.query(addSql, addSqlParams, function (err, result2) {
        if (err) {
            console.log(err)
            res.json({
                code: 0,
                msg: "未知错误"
            })
            return;
        }
        console.log('--------------------------INSERT----------------------------');
        res.json({
            code: 1,
            msg: "成功"
        })

    });
})
// 查询新闻
app.get('/select/news_old', function (req, res, next) {
    // console.log(req.query)
    if (req.query.id) {
        var sql = "select * from wrj_news where id = " + parseInt(req.query.id);
    } else if (req.query.city) {
        var sql = "select * from wrj_news where region = '" + req.query.city + "'" + " order by id desc";
        // console.log(sql)
    } else {
        var sql = "select * from wrj_news" + " order by id desc";
    }


    //查
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "无法查询新闻列表"
            })
            console.log('[select ERROR] - ', err.message);
            return;
        }
        if (userData.length === 0) {
            res.json({
                code: 0,
                data: userData,
                msg: "无数据"
            })
            return;
        }
        //总数
        var length = userData.length;
        //可分页数
        var total = Math.ceil(userData.length / 10);

        var backData = [];
        //10==每页条数
        var num = (req.query.index - 1) * 10;
        for (var i = 0; i < 10; i++) {
            if (userData[num + i]) {
                backData.push(userData[num + i])
            } else {
                break;
            }
        }
        // if(req.query.index){
        //     var index=2*parseInt(req.query.index);
        //     var  sql = "select * from wrj_news limit "+parseInt(index-2)+",2";
        // }
        if (req.query.index) {

            res.json({
                code: 1,
                data: backData,
                total: total,
                msg: "查询成功"
            })
        } else {
            res.json({
                code: 1,
                data: userData,
                total: total,
                msg: "查询成功"
            })
        }



    })

})

// 删除新闻
app.get('/del/news', function (req, res, next) {
    var index = parseInt(req.query.id);
    var sql = 'DELETE FROM wrj_news where id = ' + index;
    //查
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "删除失败"
            })
            console.log('[alter ERROR] - ', err.message);
            return;
        }
        res.json({
            code: 1,
            data: userData,
            msg: "删除成功"
        })
    })

})
// 后台登录
app.post('/manage/login', (req, res) => {
    //要生成 token 的主题信息
    if (!req.body.passWord) {
        res.json({
            code: 0,
            msg: "密码不能为空"
        })
        return false;
    }
    var Identification = req.body.name;
    if (!Identification) {
        res.json({
            code: 0,
            msg: "用户不能为空"
        })
        return false;
    }
    let secret = 'wurenji';
    let user = {
        userName: Identification
    }
    let token_ = jwt.sign(user, secret, {
        'expiresIn': 60 * 60 * 12 // 设置过期时间, 12 小时
    })
    var sql = "select * from wrj_manage where name = '" + Identification + "' and passWord = '" + req.body.passWord + "'";
    // console.log(sql)
    //查
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "参数错误"
            })
            return;
        }
        console.log(result)
        if (result.length === 0) {
            res.json({
                code: 0,
                msg: "登录失败"
            })
            return;
        } else {
            var modSql = 'UPDATE wrj_manage SET token = ? WHERE name = ? and passWord= ?';
            var modSqlParams = [token_, Identification, req.body.passWord];
            //添加vip
            connection.query(modSql, modSqlParams, function (err, UPdata) {
                if (err) {
                    console.log('[UPDATE ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "登录失败"
                    })
                    return;
                }
                res.json({
                    code: 1,
                    data: {
                        userName: result[0].name,
                        power: result[0].power,
                        token: token_,
                        type: 'login',
                    },
                    msg: "登录成功"
                })
            })

        }
    })
})

// 消息
// 删除消息
app.get('/del/message', function (req, res, next) {
    var index = parseInt(req.query.id);
    var sql = 'DELETE FROM wrj_message where id = ' + index;
    //查
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "删除失败"
            })
            console.log('[DELETE ERROR] - ', err.message);
            return;
        }
        res.json({
            code: 1,
            data: userData,
            msg: "删除成功"
        })
    })

})
// 编辑消息
app.get('/edit/message', function (req, res, next) {
    var hot = parseInt(req.query.hot);
    if (hot === 1) {
        var addSql = 'UPDATE wrj_message SET hot = ?  WHERE region = ?';
        var addSqlParams = [0, req.query.region];
        connection.query(addSql, addSqlParams, function (err, result2) {
            if (err) {
                console.log(err)
                res.json({
                    code: 0,
                    msg: "未知错误region"
                })
                return;
            }
            messageEdit();
        })
    } else {
        messageEdit();
    }

    function messageEdit() {
        var addSql = 'UPDATE wrj_message SET title = ?, icon = ?, content = ?, region = ?, type = ?, hot = ?, validityPeriod = ?  WHERE id = ?';
        var addSqlParams = [req.query.title, req.query.icon, req.query.content, req.query.region, req.query.type, parseInt(req.query.hot), req.query.validityPeriod, parseInt(req.query.id)];
        connection.query(addSql, addSqlParams, function (err, result2) {
            if (err) {
                console.log(err)
                res.json({
                    code: 0,
                    msg: "未知错误"
                })
                return;
            }
            res.json({
                code: 1,
                msg: "成功"
            })

        });
    }
})
// 添加消息
app.get('/add/message', function (req, res, next) {
    var hot = parseInt(req.query.tuijian);
    if (hot === 1) {
        var addSql = 'UPDATE wrj_message SET hot = ?  WHERE region = ?';
        var addSqlParams = [0, req.query.region];
        connection.query(addSql, addSqlParams, function (err, result2) {
            if (err) {
                console.log(err)
                res.json({
                    code: 0,
                    msg: "未知错误region"
                })
                return;
            }
        })
    }
    var addSql = 'INSERT INTO wrj_message(title,icon,content,region,type,hot,time,validityPeriod,notice) VALUES(?,?,?,?,?,?,?,?,?)';
    var addSqlParams = [req.query.title, req.query.icon, req.query.content, req.query.region, req.query.type, parseInt(req.query.tuijian), Date.parse(new Date()), req.query.validityPeriod, req.query.notice];
    connection.query(addSql, addSqlParams, function (err, result2) {
        if (err) {
            console.log(err)
            res.json({
                code: 0,
                msg: "未知错误"
            })
            return;
        }
        console.log('--------------------------INSERT----------------------------');
        res.json({
            code: 1,
            msg: "成功"
        })

    });
})

// 查询消息
// app.get('/select/message', function (req, res, next) {
app.get('/select/news', function (req, res, next) {
    // console.log(req.query)
    var timestamp = Date.parse(new Date());
    timestamp = ((timestamp / 1000) - 86400) * 1000;
    if (req.query.id) {
        var sql = "select * from wrj_message where id = " + parseInt(req.query.id);
    } else if (req.query.city) {
        if (req.query.hot) {
            var sql = "select * from wrj_message where region = '" + req.query.city + "' and hot = " + req.query.hot + " and (UNIX_TIMESTAMP(validityPeriod)*1000) >" + timestamp + " order by id desc";
            console.log(sql)
        } else {
            var sql = "select * from wrj_message where region = '" + req.query.city + "' and (UNIX_TIMESTAMP(validityPeriod)*1000) >" + timestamp + " order by id desc";
        }

        // console.log(sql)
    } else {
        var sql = "select * from wrj_message where (UNIX_TIMESTAMP(validityPeriod)*1000) >" + timestamp + ' order by id desc';
    }


    //查
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "无法查询新闻列表"
            })
            console.log('[select ERROR] - ', err.message);
            return;
        }
        if (userData.length === 0) {
            res.json({
                code: 0,
                data: userData,
                msg: "无数据"
            })
            return;
        }
        //总数
        var length = userData.length;
        //可分页数
        var total = Math.ceil(userData.length / 10);

        var backData = [];
        //10==每页条数
        var num = (req.query.index - 1) * 10;
        for (var i = 0; i < 10; i++) {
            if (userData[num + i]) {
                backData.push(userData[num + i])
            } else {
                break;
            }
        }
        // if(req.query.index){
        //     var index=2*parseInt(req.query.index);
        //     var  sql = "select * from wrj_news limit "+parseInt(index-2)+",2";
        // }
        if (req.query.index) {

            res.json({
                code: 1,
                data: backData,
                total: total,
                msg: "查询成功"
            })
        } else {
            res.json({
                code: 1,
                data: userData,
                total: total,
                msg: "查询成功"
            })
        }



    })

})

// 标签上传
app.post('/label/up', function (req, res, next) {
    console.log(req.body);
    var addSql = 'INSERT INTO wrj_label(userId,lat,lng,flyType,scenery,photography,driving,tuBu,fee,text,image,visible,address_name,address_content,createTime) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    var addSqlParams = [Number(req.body.userId), Number(req.body.lat), Number(req.body.lng), req.body.flyType, req.body.scenery, req.body.photography, req.body.driving, req.body.tuBu, req.body.fee, req.body.text, req.body.image, Number(req.body.visible), req.body.address_name, req.body.address_content, timestampToTime(new Date() / 1000, true)];
    connection.query(addSql, addSqlParams, function (err, result2) {
        if (err) {
            console.log(err)
            res.json({
                code: 0,
                msg: "上传错误"
            })
            return;
        }

        console.log('--------------------------标签上传----------------------------');
        res.json({
            code: 1,
            data: {
                id: result2.insertId
            },
            msg: "成功"
        })

    });

})
// 标签范围内图片查询
app.get('/range/label/img', function (req, res, next) {
    if (req.query.userId) {
        var sql = `select T.* ,
        (SELECT name FROM wrj_user WHERE id = T.userId) as userName
        from wrj_label T 
        where sqrt( ( 
        ((${req.query.lng}-lng)*PI()*12656*cos(((${req.query.lat}+lat)/2)*PI()/180)/180) * 
        ((${req.query.lng}-lng)*PI()*12656*cos (((${req.query.lat}+lat)/2)*PI()/180)/180) ) + 
        (((${req.query.lat}-lat)*PI()*12656/180) * ((${req.query.lat}-lat)*PI()*12656/180) ) )<${req.query.distance / 1000} AND (visible != 1 or (userId=${req.query.userId} AND visible =1 )) order by id desc`;
    } else {
        var sql = `select T.* ,
        (SELECT name FROM wrj_user WHERE id = T.userId) as userName
        from wrj_label T 
        where visible != 1 and sqrt( ( 
        ((${req.query.lng}-lng)*PI()*12656*cos(((${req.query.lat}+lat)/2)*PI()/180)/180) * 
        ((${req.query.lng}-lng)*PI()*12656*cos (((${req.query.lat}+lat)/2)*PI()/180)/180) ) + 
        (((${req.query.lat}-lat)*PI()*12656/180) * ((${req.query.lat}-lat)*PI()*12656/180) ) )<${req.query.distance / 1000} order by id desc`;
    }
    console.log(sql)
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "缺少参数无法查询图片"
            })
            console.log('[select ERROR] - ', err.message);
            return;
        }
        var allImg = [];
        for (var i = 0; i < userData.length; i++) {
            if (userData.length > 0 && userData[i].image) {
                userData[i].image = JSON.parse(userData[i].image);
                for (var j = 0; j < userData[i].image.length; j++) {
                    allImg.push(userData[i].image[j]);
                }
                // userData[i].image = userData[i].image.filter(function (e) { return e });
            } else {
                userData[i].image = [];
            }
        }
        res.json({
            code: 1,
            data: allImg,
            msg: "成功"
        })
    })

})
// 范围内标签查询
app.get('/label/select', function (req, res, next) {
    if (req.query.userId) {
        var sql = `select T.* ,
        (SELECT name FROM wrj_user WHERE id = T.userId) as userName
        from wrj_label T 
        where sqrt( ( 
        ((${req.query.lng}-lng)*PI()*12656*cos(((${req.query.lat}+lat)/2)*PI()/180)/180) * 
        ((${req.query.lng}-lng)*PI()*12656*cos (((${req.query.lat}+lat)/2)*PI()/180)/180) ) + 
        (((${req.query.lat}-lat)*PI()*12656/180) * ((${req.query.lat}-lat)*PI()*12656/180) ) )<${req.query.distance / 1000} AND (visible != 1 or (userId=${req.query.userId} AND visible =1 )) order by id desc`;
    } else {
        var sql = `select T.* ,
        (SELECT name FROM wrj_user WHERE id = T.userId) as userName
        from wrj_label T 
        where visible != 1 and sqrt( ( 
        ((${req.query.lng}-lng)*PI()*12656*cos(((${req.query.lat}+lat)/2)*PI()/180)/180) * 
        ((${req.query.lng}-lng)*PI()*12656*cos (((${req.query.lat}+lat)/2)*PI()/180)/180) ) + 
        (((${req.query.lat}-lat)*PI()*12656/180) * ((${req.query.lat}-lat)*PI()*12656/180) ) )<${req.query.distance / 1000} order by id desc`;

    }
    console.log(sql)
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "无法查询标签列表"
            })
            console.log('[select ERROR] - ', err.message);
            return;
        }
        var backData = [];
        if (req.query.index) {
            //总数
            var length = userData.length;
            //可分页数
            var total = Math.ceil(userData.length / 10);


            //10==每页条数
            var num = (req.query.index - 1) * 10;
            for (var i = 0; i < 10; i++) {
                if (userData[num + i]) {
                    backData.push(userData[num + i])
                } else {
                    break;
                }
            }
            userData = backData;
        } else {
            var total = 1;
        }
        for (var i = 0; i < userData.length; i++) {
            if (userData.length > 0 && userData[i].image) {
                userData[i].image = JSON.parse(userData[i].image);
                // userData[i].image = userData[i].image.filter(function (e) { return e });
            } else {
                userData[i].image = [];
            }
        }
        res.json({
            code: 1,
            data: userData,
            total: total,
            msg: "成功"
        })

    });
})
// 查询指定标签
app.get('/designation/label', function (req, res, next) {
    if (req.query.id) {
        var sql = `select T.* ,
        (SELECT name FROM wrj_user WHERE id = T.userId) as userName
        from wrj_label T 
        where id = ${req.query.id}
        order by id desc
        `;
    } else if (req.query.userId) {
        var sql = `select T.* ,
        (SELECT name FROM wrj_user WHERE id = T.userId) as userName
        from wrj_label T 
        where userId = ${req.query.userId}
        order by id desc
        `;
    } else {
        var sql = `select * from wrj_label where visible != 1  order by id desc`;
    }
    // console.log(sql)
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "无法查询标签"
            })
            console.log('[select ERROR] - ', err.message);
            return;
        }
        for (var i = 0; i < userData.length; i++) {
            if (userData.length > 0 && userData[i].image) {
                userData[i].image = JSON.parse(userData[i].image)
                userData[i].image = userData[i].image.filter(function (e) { return e });
            } else {
                userData[i].image = [];
            }
        }
        if (req.query.id && req.query.userId) {
            var sql = `select * from wrj_favoriteLabel where userId = ${req.query.userId} and labelId = ${req.query.id}  order by id desc`;
            connection.query(sql, function (err, labelData) {
                if (labelData.length > 0) {
                    userData[0].collection = true;
                    userData[0].collectionId = labelData[0].id;
                    res.json({
                        code: 1,
                        data: userData,
                        msg: "成功"
                    })
                } else {
                    if (userData[0]) {
                        userData[0].collection = false;
                    } else {
                        userData = [{ collection: false }]
                    }
                    res.json({
                        code: 1,
                        data: userData,
                        msg: "成功"
                    })
                }
            })
        } else {
            var backData = [];
            if (req.query.index) {
                //总数
                var length = userData.length;
                //可分页数
                var total = Math.ceil(userData.length / 10);


                //10==每页条数
                var num = (req.query.index - 1) * 10;
                for (var i = 0; i < 10; i++) {
                    if (userData[num + i]) {
                        backData.push(userData[num + i])
                    } else {
                        break;
                    }
                }
                userData = backData;
            } else {
                var total = 1;
            }
            res.json({
                code: 1,
                data: userData,
                total: total,
                msg: "成功"
            })
        }


    });

})

// 删除标签
app.post('/del/label', function (req, res, next) {
    var index = parseInt(req.body.id);
    var sql = 'DELETE FROM wrj_label where id = ' + index;
    //查
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "删除失败"
            })
            console.log('[DELETE ERROR] - ', err.message);
            return;
        }
        res.json({
            code: 1,
            msg: "删除成功"
        })
    })
})
// 飞行路径上传
app.post('/fly/path', function (req, res, next) {
    var timestamp = Date.parse(new Date());
    timestamp = (timestamp / 1000);
    timestamp = Date.parse(timestampToTime(timestamp)) / 1000;
    var sql = `select * from wuj_flyPath where  (UNIX_TIMESTAMP(createTime)*1000) > ${(timestamp) * 1000} and  (UNIX_TIMESTAMP(createTime)*1000) < ${(timestamp + 86400) * 1000} and userId = ${req.body.userId}`;
    connection.query(sql, function (err, flyPath_num) {
        if (err) {
            console.log(err)
            res.json({
                code: 0,
                msg: "上传错误"
            })
            return;
        }
        if (flyPath_num.length >= 3) {
            res.json({
                code: 3,
                msg: "每日上传飞行路径不能超过3条"
            })
        } else {
            console.log(req.body);
            var addSql = 'INSERT INTO wuj_flyPath(userId,lat,lng,place,startTime,endTime,createTime) VALUES(?,?,?,?,?,?,?)';
            var addSqlParams = [Number(req.body.userId), req.body.lat, req.body.lng, req.body.place, req.body.startTime, req.body.endTime, timestampToTime(new Date() / 1000, true)];
            connection.query(addSql, addSqlParams, function (err, result2) {
                if (err) {
                    console.log(err)
                    res.json({
                        code: 0,
                        msg: "上传错误"
                    })
                    return;
                }
                console.log('--------------------------飞行路径上传----------------------------');
                res.json({
                    code: 1,
                    data: {
                        id: result2.insertId
                    },
                    msg: "成功"
                })

            });
        }

    })

})
// 范围内飞行路径查询
app.get('/flyPath/select', function (req, res, next) {
    var utc_timestamp = Date.parse(new Date())
    var sql = `select T.* ,
        (SELECT name FROM wrj_user WHERE id = T.userId) as userName
        from wuj_flyPath T 
        where endTime > ${utc_timestamp} and sqrt( ( 
        ((${req.query.lng}-lng)*PI()*12656*cos(((${req.query.lat}+lat)/2)*PI()/180)/180) * 
        ((${req.query.lng}-lng)*PI()*12656*cos (((${req.query.lat}+lat)/2)*PI()/180)/180) ) + 
        (((${req.query.lat}-lat)*PI()*12656/180) * ((${req.query.lat}-lat)*PI()*12656/180) ) )<${req.query.distance / 1000} order by id desc`;
    console.log(sql)
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "无法查询飞行路径列表"
            })
            console.log('[select ERROR] - ', err.message);
            return;
        }
        var backData = [];
        if (req.query.index) {
            //总数
            var length = userData.length;
            //可分页数
            var total = Math.ceil(userData.length / 10);


            //10==每页条数
            var num = (req.query.index - 1) * 10;
            for (var i = 0; i < 10; i++) {
                if (userData[num + i]) {
                    backData.push(userData[num + i])
                } else {
                    break;
                }
            }
            userData = backData;
        } else {
            var total = 1;
        }

        res.json({
            code: 1,
            data: userData,
            total: total,
            msg: "成功"
        })

    });

})

// 删除飞行路径
app.post('/del/flyPath', function (req, res, next) {
    var index = parseInt(req.body.id);
    var sql = 'DELETE FROM wuj_flyPath where id = ' + index;
    //查
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "删除失败"
            })
            console.log('[DELETE ERROR] - ', err.message);
            return;
        }
        res.json({
            code: 1,
            msg: "删除成功"
        })
    })

})
// 查询我上传的飞行路径
app.get('/my/flyPath', function (req, res, next) {
    var utc_timestamp = Date.parse(new Date())
    var sql = `select T.* ,
        (SELECT name FROM wrj_user WHERE id = T.userId) as userName
        from wuj_flyPath T 
        where userId = ${req.query.id} order by id desc`;
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "无法查询飞行路径列表"
            })
            console.log('[select ERROR] - ', err.message);
            return;
        }
        var backData = [];
        if (req.query.index) {
            //总数
            var length = userData.length;
            //可分页数
            var total = Math.ceil(userData.length / 10);
            //10==每页条数
            var num = (req.query.index - 1) * 10;
            for (var i = 0; i < 10; i++) {
                if (userData[num + i]) {
                    backData.push(userData[num + i])
                } else {
                    break;
                }
            }
            userData = backData;
        } else {
            var total = 1;
        }

        res.json({
            code: 1,
            data: userData,
            total: total,
            msg: "成功"
        })

    });

})
// 忘记密码
app.post('/forget/password', function (req, res, next) {
    if (!req.body.passWord) {
        res.json({
            code: 0,
            msg: "密码不能为空"
        })
        return false;
    }
    if (!req.body.code) {
        res.json({
            code: 0,
            msg: "验证码不能为空"
        })
        return false;
    }
    var Identification = req.body.email || req.body.phone;
    if (!Identification) {
        res.json({
            code: 0,
            msg: "用户不能为空"
        })
        return false;
    }
    // var sql = "select * from wrj_user where user_name = '" + Identification + "'";
    var sql = `SELECT 
            T.*,(SELECT code FROM wrj_register_code WHERE user_name = T.Identification) as 'code' 
            FROM 
            wrj_user T 
            WHERE 
            Identification = '${Identification}'`
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "无法查询用户信息"
            })
            console.log('[select ERROR] - ', err.message);
            return;
        }
        if (userData.length === 0) {
            res.json({
                code: 0,
                msg: "用户不存在"
            })
            return;
        } else {
            if (req.body.code != userData[0].code) {
                res.json({
                    code: 0,
                    msg: "验证码错误"
                })
                return;
            } else {
                var addSql = 'UPDATE wrj_user SET passWord = ?  WHERE Identification = ?';
                var addSqlParams = [req.body.passWord, Identification];
                connection.query(addSql, addSqlParams, function (err, result2) {
                    if (err) {
                        console.log(err)
                        res.json({
                            code: 0,
                            msg: "修改密码失败"
                        })
                        return;
                    } else {
                        res.json({
                            code: 1,
                            msg: "修改密码成功"
                        })
                    }
                })
            }
        }
    })
})

// 修改密码
app.post('/change/password', function (req, res, next) {
    if (!req.body.oldPassWord) {
        res.json({
            code: 0,
            msg: "旧密码不能为空"
        })
        return false;
    }
    if (!req.body.newPassWord) {
        res.json({
            code: 0,
            msg: "新密码不能为空"
        })
        return false;
    }
    var Identification = req.body.id
    if (!Identification) {
        res.json({
            code: 0,
            msg: "用户不能为空"
        })
        return false;
    }
    var sql = "select * from wrj_user where id = " + Identification;
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "无法查询用户信息"
            })
            console.log('[select ERROR] - ', err.message);
            return;
        }
        if (userData.length === 0) {
            res.json({
                code: 0,
                msg: "用户不存在"
            })
            return;
        } else {
            if (req.body.oldPassWord != userData[0].passWord) {
                res.json({
                    code: 0,
                    msg: "密码错误"
                })
                return;
            } else {
                var addSql = 'UPDATE wrj_user SET passWord = ?  WHERE id = ?';
                var addSqlParams = [req.body.newPassWord, Identification];
                connection.query(addSql, addSqlParams, function (err, result2) {
                    if (err) {
                        console.log(err)
                        res.json({
                            code: 0,
                            msg: "修改密码失败"
                        })
                        return;
                    } else {
                        res.json({
                            code: 1,
                            msg: "修改密码成功"
                        })
                    }
                })
            }
        }
    })
})
// 修改用户信息
app.post('/edit/userData', function (req, res, next) {
    var Identification = req.body.id
    let str = ``;
    let addSqlParams = [];
    for (var key in req.body) {//用javascript的for/in循环遍历对象的属性 
        if (key == "id") {
            console.log(key)
        } else {
            str += `${key} = ?,`
            addSqlParams.push(req.body[key])
        }

    }
    console.log(str)

    if (!Identification) {
        res.json({
            code: 0,
            msg: "用户不能为空"
        })
        return false;
    }
    str = str.substring(0, str.length - 1);
    let addSql = `UPDATE wrj_user SET ${str}  WHERE id = ${req.body.id}`;
    connection.query(addSql, addSqlParams, function (err, result2) {
        if (err) {
            console.log(err)
            res.json({
                code: 0,
                msg: "修改失败"
            })
            return;
        } else {
            res.json({
                code: 1,
                msg: "修改成功"
            })
        }
    })
})
// 收藏标签
app.post('/favorite/label', function (req, res, next) {
    var sql = `select * from wrj_favoriteLabel where userId =  ${req.body.userId} and labelId = ${req.body.labelId}`;
    connection.query(sql, function (err, labelData) {
        if (err) {
            console.log(err)
            res.json({
                code: 0,
                msg: "收藏失败"
            })
            return;
        }
        if (labelData.length > 0) {
            res.json({
                code: 0,
                msg: "不能重复收藏"
            })
        } else {
            var addSql = 'INSERT INTO wrj_favoriteLabel(userId,labelId) VALUES(?,?)';
            var addSqlParams = [req.body.userId, req.body.labelId];
            connection.query(addSql, addSqlParams, function (err, result2) {
                if (err) {
                    console.log(err)
                    res.json({
                        code: 0,
                        msg: "收藏失败"
                    })
                    return;
                }
                res.json({
                    code: 1,
                    data: {
                        id: result2.insertId
                    },
                    msg: "收藏成功"
                })
            });
        }
    })
})
// 查询我的收藏标签
app.get('/select/favorite/label', function (req, res, next) {
    var index = parseInt(req.query.id);
    // var sql = 'select * from wrj_favoriteLabel where userId = ' + index;

    var sql = "SELECT a.*,b.address_content,b.address_name,b.lng,b.lat,b.createTime,b.image,b.text,c.userName FROM `wrj_favoriteLabel` as a ";
    sql += `
        LEFT JOIN (SELECT address_content,address_name,lng,lat,id,userId as userId2,createTime,image,text FROM wrj_label) as b
        on a.labelId=b.id
        LEFT JOIN (SELECT name as userName,id FROM wrj_user) as c
        on b.userId2=c.id
        where userId = ${index}
        ORDER BY a.id DESC`;
    //查
    console.log(sql)
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "查询失败"
            })
            console.log(err.message);
            return;
        }
        var backData = [];
        if (req.query.index) {
            //总数
            var length = userData.length;
            //可分页数
            var total = Math.ceil(userData.length / 10);


            //10==每页条数
            var num = (req.query.index - 1) * 10;
            for (var i = 0; i < 10; i++) {
                if (userData[num + i]) {
                    backData.push(userData[num + i])
                } else {
                    break;
                }
            }
            userData = backData;
        } else {
            var total = 1;
        }
        for (var i = 0; i < userData.length; i++) {
            if (userData.length > 0 && userData[i].image) {
                userData[i].image = JSON.parse(userData[i].image);
                userData[i].image = userData[i].image.filter(function (e) { return e });
            } else {
                userData[i].image = [];
            }
        }
        res.json({
            code: 1,
            data: userData,
            total: total,
            msg: "查询成功"
        })
    })
})
// 取消指定的收藏标签
app.post('/del/favorite/label', function (req, res, next) {
    var index = parseInt(req.body.id);
    var sql = 'DELETE FROM wrj_favoriteLabel where id = ' + index;
    //查
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "取消收藏失败"
            })
            console.log(err.message);
            return;
        }
        res.json({
            code: 1,
            msg: "取消收藏成功"
        })
    })
})
// 收藏地点
app.post('/favorite/location', function (req, res, next) {
    var sql = `select * from wrj_favoriteLocation where userId =  ${req.body.userId} and locationName = '${req.body.locationName}' and lng = ${req.body.lng} and lat = ${req.body.lat}`;
    connection.query(sql, function (err, location) {
        if (err) {
            console.log(err)
            res.json({
                code: 0,
                msg: "收藏失败"
            })
            return;
        }
        if (location.length > 0) {
            res.json({
                code: 0,
                msg: "不能重复收藏"
            })
        } else {
            var addSql = 'INSERT INTO wrj_favoriteLocation(userId,locationName,lng,lat) VALUES(?,?,?,?)';
            var addSqlParams = [req.body.userId, req.body.locationName, req.body.lng, req.body.lat];
            connection.query(addSql, addSqlParams, function (err, result2) {
                if (err) {
                    console.log(err)
                    res.json({
                        code: 0,
                        msg: "收藏失败"
                    })
                    return;
                }

                res.json({
                    code: 1,
                    data: {
                        id: result2.insertId
                    },
                    msg: "收藏成功"
                })
            });
        }
    })
})
// 查询我的收藏地点
app.get('/select/favorite/location', function (req, res, next) {
    var index = parseInt(req.query.id);
    if (req.query.lat && req.query.lng) {
        var sql = `select * from wrj_favoriteLocation where userId =  ${index} and lat = ${req.query.lat} and lng = ${req.query.lng}`;
    } else {
        var sql = 'select * from wrj_favoriteLocation where userId = ' + index;
    }

    //查
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "查询失败"
            })
            console.log('[alter ERROR] - ', err.message);
            return;
        }
        if (req.query.lat && req.query.lng) {
            if (userData.length > 0) {
                userData[0].collection = true;
                res.json({
                    code: 1,
                    data: userData,
                    msg: "查询成功"
                })
            } else {
                userData = [{ collection: false }]
                // userData[0].collection = false;
                res.json({
                    code: 1,
                    data: userData,
                    msg: "未收藏"
                })
            }

        } else {
            var backData = [];
            if (req.query.index) {
                //总数
                var length = userData.length;
                //可分页数
                var total = Math.ceil(userData.length / 10);


                //10==每页条数
                var num = (req.query.index - 1) * 10;
                for (var i = 0; i < 10; i++) {
                    if (userData[num + i]) {
                        backData.push(userData[num + i])
                    } else {
                        break;
                    }
                }
                userData = backData;
            } else {
                var total = 1;
            }
            res.json({
                code: 1,
                data: userData,
                total: total,
                msg: "查询成功"
            })
        }
    })

})
// 取消指定的收藏地点
app.post('/del/favorite/location', function (req, res, next) {
    var index = parseInt(req.body.id);
    var sql = 'DELETE FROM wrj_favoriteLocation where id = ' + index;
    //查
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "取消收藏失败"
            })
            console.log('[alter ERROR] - ', err.message);
            return;
        }
        res.json({
            code: 1,
            msg: "取消收藏成功"
        })
    })
})
// ios订阅
app.post('/ios/pay/notice', function (req, res, next) {
    var sql = `select * from wrj_iosPaper WHERE content =  '${req.body["receipt-data"]}'`;
    connection.query(sql, function (err, verifyReceipt) {
        if (err) {
            console.log(err)
            res.json({
                code: 0,
                msg: err
            })
            return;
        }
        if (verifyReceipt[0]) {
            res.json({
                code: 3,
                msg: "该票据已使用"
            })
        } else {
            req.body.password = "0e2b4096077149bb9d2bb6e6b46c6bb0";
            // 线上
            var online = 'https://buy.itunes.apple.com/verifyReceipt';
            // 沙盒
            var sandbox = "https://sandbox.itunes.apple.com/verifyReceipt";
            console.log(req.body)
            request({
                url: online,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: req.body
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (body.status === 21007) {
                        request({
                            url: sandbox,
                            method: "POST",
                            json: true,
                            headers: {
                                "content-type": "application/json",
                            },
                            body: req.body
                        }, function (error, response, body) {
                            // ios订阅票据验证
                            if (body.latest_receipt) {
                                if (req.body.userId) {
                                    var sql = `select * from wrj_user WHERE id =  ${req.body.userId}`;
                                    connection.query(sql, function (err, userData) {
                                        if (err) {
                                            res.json({
                                                code: 0,
                                                msg: "查询失败"
                                            })
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
                                        var timestamp = body.receipt.in_app[0].expires_date_ms / 1000;

                                        var time = Date.parse(userData.expiretime);
                                        time = (time / 1000) - timestamp;
                                        if (time == null || !time || time <= 0 || time == NaN) {
                                            if (body.receipt.in_app[0].product_id == "DronesMapPay_YearVip") {
                                                timestamp = timestampToTime(timestamp + (day * 365));
                                            } else if (body.receipt.in_app[0].product_id == "DronesMapPay_MonthVip") {
                                                timestamp = timestampToTime(timestamp + (day * 30));
                                            }
                                        } else {
                                            if (body.receipt.in_app[0].product_id == "DronesMapPay_YearVip") {
                                                timestamp = timestampToTime(timestamp + (day * 365) + time);
                                            } else if (body.receipt.in_app[0].product_id == "DronesMapPay_MonthVip") {
                                                timestamp = timestampToTime(timestamp + (day * 30) + time);
                                            }
                                        }
                                        var modSql = 'UPDATE wrj_user SET isvip = ? , expiretime = ?  WHERE id = ?';
                                        var modSqlParams = [1, timestamp, req.body.userId];
                                        //添加vip
                                        connection.query(modSql, modSqlParams, function (err, UPdata) {
                                            if (err) {
                                                console.log('[UPDATE ERROR] - ', err.message);
                                                return;
                                            }
                                            var addSql = 'INSERT INTO wrj_iosPaper(content,userId,vipType,date) VALUES(?,?,?,?)';
                                            var addSqlParams = [req.body["receipt-data"], req.body.userId, body.receipt.in_app[0].product_id, timestampToTime(Date.parse(new Date()) / 1000, true)];
                                            connection.query(addSql, addSqlParams, function (err, result2) {
                                                if (err) {
                                                    console.log(err)
                                                    res.json({
                                                        code: 0,
                                                        msg: "收藏失败"
                                                    })
                                                    return;
                                                }
                                                res.json({
                                                    code: 1,
                                                    data: body,
                                                    msg: "开通成功"
                                                })

                                            });
                                        })
                                    })
                                } else {
                                    var addSql = 'INSERT INTO wrj_iosPaper(content,userId,vipType,date) VALUES(?,?,?,?)';
                                    var addSqlParams = [req.body["receipt-data"], null, body.receipt.in_app[0].product_id, timestampToTime(Date.parse(new Date()) / 1000, true)];
                                    connection.query(addSql, addSqlParams, function (err, result2) {
                                        if (err) {
                                            console.log(err)
                                            res.json({
                                                code: 0,
                                                msg: "收藏失败"
                                            })
                                            return;
                                        }
                                        res.json({
                                            code: 1,
                                            data: body,
                                            msg: "游客开通成功"
                                        })
                                    });
                                }
                            } else {
                                res.json({
                                    code: 1,
                                    data: body,
                                    msg: "isok"
                                })
                            }
                        })
                    } else {
                        // ios订阅票据验证
                        if (body.latest_receipt) {
                            if (req.body.userId) {
                                var sql = `select * from wrj_user WHERE id =  ${req.body.userId}`;
                                connection.query(sql, function (err, userData) {
                                    if (err) {
                                        res.json({
                                            code: 0,
                                            msg: "查询失败"
                                        })
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
                                    var timestamp = body.receipt.in_app[0].expires_date_ms / 1000;

                                    var time = Date.parse(userData.expiretime);
                                    time = (time / 1000) - timestamp;
                                    if (time == null || !time || time <= 0 || time == NaN) {
                                        if (body.receipt.in_app[0].product_id == "DronesMapPay_YearVip") {
                                            timestamp = timestampToTime(timestamp + (day * 365));
                                        } else if (body.receipt.in_app[0].product_id == "DronesMapPay_MonthVip") {
                                            timestamp = timestampToTime(timestamp + (day * 30));
                                        }
                                    } else {
                                        if (body.receipt.in_app[0].product_id == "DronesMapPay_YearVip") {
                                            timestamp = timestampToTime(timestamp + (day * 365) + time);
                                        } else if (body.receipt.in_app[0].product_id == "DronesMapPay_MonthVip") {
                                            timestamp = timestampToTime(timestamp + (day * 30) + time);
                                        }
                                    }
                                    var modSql = 'UPDATE wrj_user SET isvip = ? , expiretime = ?  WHERE id = ?';
                                    var modSqlParams = [1, timestamp, req.body.userId];
                                    //添加vip
                                    connection.query(modSql, modSqlParams, function (err, UPdata) {
                                        if (err) {
                                            console.log('[UPDATE ERROR] - ', err.message);
                                            return;
                                        }
                                        var addSql = 'INSERT INTO wrj_iosPaper(content,userId,vipType,date) VALUES(?,?,?,?)';
                                        var addSqlParams = [req.body["receipt-data"], req.body.userId, body.receipt.in_app[0].product_id, timestampToTime(Date.parse(new Date()) / 1000, true)];
                                        connection.query(addSql, addSqlParams, function (err, result2) {
                                            if (err) {
                                                console.log(err)
                                                res.json({
                                                    code: 0,
                                                    msg: "开通失败"
                                                })
                                                return;
                                            }
                                            res.json({
                                                code: 1,
                                                data: body,
                                                msg: "开通成功"
                                            })

                                        });
                                    })
                                })
                            } else {
                                var addSql = 'INSERT INTO wrj_iosPaper(content,userId,vipType,date) VALUES(?,?,?,?)';
                                var addSqlParams = [req.body["receipt-data"], null, body.receipt.in_app[0].product_id, timestampToTime(Date.parse(new Date()) / 1000, true)];
                                connection.query(addSql, addSqlParams, function (err, result2) {
                                    if (err) {
                                        console.log(err)
                                        res.json({
                                            code: 0,
                                            msg: "游客开通失败"
                                        })
                                        return;
                                    }
                                    res.json({
                                        code: 1,
                                        data: body,
                                        msg: "游客开通成功"
                                    })
                                });
                            }
                        } else {
                            res.json({
                                code: 1,
                                data: body,
                                msg: "isok"
                            })
                        }
                    }
                } else {
                    res.json({
                        code: 0,
                        msg: "无法请求"
                    })
                }
            });
        }
    })
})
// 支付
app.post('/pay', function (req, res, next) {
    console.log(req.body)
    if (req.body.viptype) {

    } else {
        if (!req.body.userId || !req.body.toUserId) {
            res.json({
                code: 0,
                msg: "缺少必要用户id"
            })
            return;
        }
    }

    var payObj = {
        userId: req.body.userId,
        money: req.body.money || 0.01,
        toUserId: req.body.toUserId || null,
        viptype: Number(req.body.viptype) || null, //默认是空
        paytype: req.body.paytype || 2,
        label: req.body.labelId || null,
        order_time: function () {
            var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            return timestampToTime(timestamp)
        }(),
        order_number: function () {
            var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            return "WRJ" + randomNum(2) + timestamp;
        }(),
    }
    //生成订单
    var addSql = 'INSERT INTO wrj_orderList(userId,toUserId,money,order_status,order_time,viptype,order_number,paytype,labelId) VALUES(?,?,?,?,?,?,?,?,?)';
    var addSqlParams = [payObj.userId, payObj.toUserId, payObj.money, 0, payObj.order_time, payObj.viptype, payObj.order_number, payObj.paytype, payObj.label];

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
            total_amount: req.body.money, // 单位 元
            subject: '无人机支付宝支付'

        }
        const wechatOrder = {
            out_trade_no: payObj.order_number,
            body: '无人机微信支付',
            total_fee: req.body.money, // 直接以元为单位
            // spbill_create_ip: 'spbill_create_ip' // 客户端ip
        }
        const webPayResult = wechat.app(wechatOrder)
        if (!payObj.toUserId || payObj.viptype) {
            order.subject = "无人机vip开通"
            var result = alipayVip.app(order) // 开通vip
        } else {
            var result = alipay.app(order) // 打赏
        }

        result.then(function (rs) {
            webPayResult.then(function (wc) {
                res.json({
                    code: 1,
                    data: function () {
                        if (Number(req.body.paytype) === 1) {
                            return {
                                // wechat:wc,
                                wechat: function () {

                                    return wc;
                                }(),
                                order: payObj.order_number
                            };
                        } else {
                            return {
                                // wechat:wc,
                                result: function () {

                                    return rs;
                                }(),
                                order: payObj.order_number
                            }
                        }
                    }(),
                    msg: "成功"
                })
            })

        });
    })
});
// 产品查询
app.get('/product/select', (req, res) => {

    var sql = 'select * from wrj_product';


    //查
    connection.query(sql, function (err, data) {
        if (err) {
            res.json({
                code: 0,
                msg: "无法链接数据库"
            })
            return;
        }
        res.json({
            code: 1,
            data: data,
            msg: "成功"
        })
    })
})
// 支付回调
app.post('/payBack', (req, res) => {
    console.log(req.body)
    var sql = "select * from wrj_orderList where order_number = '" + req.body.out_trade_no + "'";
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
            if (orderData.order_status == 1) {
                res.json({
                    code: 0,
                    msg: "订单已支付"
                })
                return;
            }
            var sql = ` select T.* ,
                        (SELECT name FROM wrj_user WHERE id = ${orderData.toUserId}) as toUserName,
                        (SELECT money FROM wrj_user WHERE id = ${orderData.toUserId}) as toMoney,
                        (SELECT address_name FROM wrj_label WHERE id = ${orderData.labelId}) as label
                        from wrj_user T 
                        where id = ${orderData.userId}`;
            console.log(sql)

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
                console.log(userData)

                if (!userData[0].toMoney || Number(userData[0].toMoney) == NaN) {
                    userData[0].toMoney = 0;
                } else {
                    userData[0].toMoney = Number(userData[0].toMoney);
                }
                var cash = userData[0].toMoney += Number(req.body.total_amount);

                var modSql = 'UPDATE wrj_user set money = ?  WHERE id = ?';
                var modSqlParams = [cash, orderData.toUserId];
                connection.query(modSql, modSqlParams, function (err, hh) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    var modSql = 'UPDATE wrj_orderList SET order_status = ?  WHERE order_number = ?';
                    var modSqlParams = [1, req.body.out_trade_no];
                    //添加viporderlist
                    connection.query(modSql, modSqlParams, function (err, hh) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);
                            return;
                        }
                        var addSql = 'INSERT INTO wrj_payInOut(userId,toUserId,money,info,type,label,date) VALUES(?,?,?,?,?,?,?)';
                        var addSqlParams = [orderData.userId, orderData.toUserId, req.body.total_amount, `${userData[0].name}在标签:${userData[0].label}中向${userData[0].toUserName}打赏了${req.body.total_amount}元`, 1, userData[0].label, timestampToTime((Date.parse(new Date())) / 1000, true)];
                        //增
                        connection.query(addSql, addSqlParams, function (err, result2) {
                            if (err) {
                                console.log('[INSERT ERROR] - ', err.message);
                                res.json({
                                    code: 0,
                                    msg: "注册失败"
                                })
                                return;
                            }
                            console.log("支付成功回调")
                            if (alipay.verify(req.body)) { //验签
                                console.log('支付宝异步验签成功：')
                                res.send('SUCCESS')
                            } else {
                                console.log('支付宝异步验签失败：')
                                res.send('SUCCESS')
                            }
                        })

                    })
                })
            })
        }
    })
})
// 查询资金记录
app.get('/payinout', (req, res) => {
    var sql = `select * from wrj_payInOut where userId = ${req.query.id} or toUserId = ${req.query.id}`;
    connection.query(sql, function (err, userData) {
        if (err) {
            res.json({
                code: 0,
                msg: "查询失败"
            })
            console.log(err.message);
            return;
        }
        res.json({
            code: 1,
            data: userData,
            msg: "成功"
        })
    })

})
// 支付返回
app.get('/return', (req, res) => {
    console.log("这是return")
    res.json({
        code: 1,
        msg: "这是return"
    })
})
// 支付宝VIP回调
app.post('/vipPayBack', function (req, res, next) {
    var sql = "select * from wrj_orderList where order_number = '" + req.body.out_trade_no + "'";
    //查
    connection.query(sql, function (err, orderData) {
        console.log(orderData)
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
            console.log(orderData.order_status)
            if (orderData.order_status == 1) {
                res.json({
                    code: 0,
                    msg: "订单已支付"
                })
                return;
            }


            var sql = "select * from wrj_user WHERE id = '" + orderData.userId + "'";
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
                console.log(userData)
                var timestamp = Date.parse(new Date());
                timestamp = timestamp / 1000;

                var time = Date.parse(userData.expiretime);
                time = (time / 1000) - timestamp;
                if (time == null || !time || time <= 0 || time == NaN) {
                    if (orderData.viptype === 1) {
                        timestamp = timestampToTime(timestamp + (day * 365));
                    } else if (orderData.viptype === 2) {
                        timestamp = timestampToTime(timestamp + (day * 90));
                    } else {
                        timestamp = timestampToTime(timestamp + (day * 30));

                    }
                } else {
                    if (orderData.viptype === 1) {
                        timestamp = timestampToTime(timestamp + (day * 365) + time)
                    } else if (orderData.viptype === 2) {
                        timestamp = timestampToTime(timestamp + (day * 90) + time)
                    } else {
                        timestamp = timestampToTime(timestamp + (day * 30) + time)
                    }
                }
                var modSql = 'UPDATE wrj_user SET isVip = ? , expiretime = ?  WHERE id = ?';
                var modSqlParams = [1, timestamp, orderData.userId];
                //添加vip
                connection.query(modSql, modSqlParams, function (err, UPdata) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    console.log('--------------------------UPDATE----------------------------');
                    var modSql = 'UPDATE wrj_orderList SET order_status = ?  WHERE order_number = ?';
                    var modSqlParams = [1, req.body.out_trade_no];
                    //添加viporderlist
                    connection.query(modSql, modSqlParams, function (err, hh) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);
                            return;
                        }


                        if (alipay.verify(req.body)) {
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

// 时间戳
function timestampToTime(timestampm, all) {
    var date = new Date(timestampm * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
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

// 每天凌晨执行任务(清空验证码)
var rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [0, new schedule.Range(1, 6)];

rule.hour = 14;

rule.minute = 40;

var j = schedule.scheduleJob(rule, function () {

    //  代码捎候
    console.log("执行任务");
    var sql = 'truncate table wrj_register_code';
    //清空
    connection.query(sql, function (err, result2) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        console.log("已清空");


    })

})


// 每天凌晨执行任务(vip过期判断
var rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [0, new schedule.Range(1, 6)];

rule.hour = 0;

rule.minute = 01;

var j = schedule.scheduleJob(rule, function () {
    //  代码捎候
    console.log("执行任务");
    var sql = 'SELECT * FROM wrj_user';
    //查
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        for (var i = 0; i < result.length; i++) {
            (function (i) {
                var timestamp = (Date.parse(result[i].expiretime)) / 1000;
                var todayTime = Date.parse(new Date()) / 1000;
                todayTime = timestampToTime(todayTime);
                todayTime = Date.parse(todayTime) / 1000;
                if (timestamp - todayTime < 0) {
                    var modSql = 'UPDATE wrj_user SET isvip = ?, expiretime = ? WHERE id = ?';
                    var modSqlParams = [0, null, result[i].id];
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
// https://segmentfault.com/a/1190000014399153
