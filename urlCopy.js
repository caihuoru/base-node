var express = require('express');
var app = express();
var server_port = 8021;
var mysql = require('mysql');
var ejs = require("ejs");
var schedule = require("node-schedule");
const jwt = require('jsonwebtoken');//token
var querystring = require("querystring");
var xmlreader = require("xmlreader");//xml
const https = require('https')
const http = require('http')
const net = require('net')
const path = require('path')
const fs = require('fs')

// 根据项目的路径导入生成的证书文件
const privateKey = fs.readFileSync(path.join(__dirname, './pem/foundjoy.ltd.key'), 'utf8')
const certificate = fs.readFileSync(path.join(__dirname, './pem/foundjoy.ltd.pem'), 'utf8')
const credentials = {
    key: privateKey,
    cert: certificate,
}

// 设置https的访问端口号
const SSLPORT = 7102
// 设置http的访问端口号
const PORT = 7202



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
app.locals.appName = "urlCopy";
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
// 单独的token验证
app.post('/verifytoken', (req, res) => {
    let secret = 'copy';
    let token = req.headers['auth'];
    if (!token) {
        res.json({ code: 0, status: false, message: 'token不能为空' });
        return false;
    }
    if (req.body.manage) {
        var sql = "select * from manage where token = '" + token + "'";
    } else {
        var sql = "select * from manage where token = '" + token + "'";
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
            var sql = "select * from manage where token = '" + token + "'";
            jwt.verify(result[0].token, secret, (error, result2) => {
                if (error) {
                    res.json({ code: 0, status: false });
                } else {
                    res.json({ code: 1, status: true, data: result2 });
                }
            })
        }
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
    let secret = 'copy';
    let user = {
        userName: Identification
    }
    let token_ = jwt.sign(user, secret, {
        'expiresIn': 60 * 60 * 240 // 设置过期时间, 12 小时
    })
    var sql = "select * from manage where name = '" + Identification + "' and passWord = '" + req.body.passWord + "'";
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
        if (result.length === 0) {
            res.json({
                code: 0,
                msg: "登录失败"
            })
            return;
        } else {
            var modSql = 'UPDATE manage SET token = ? WHERE name = ? and passWord= ?';
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
                        token: token_,
                        type: 'login',
                    },
                    msg: "登录成功"
                })
            })
        }
    })
})
// 打酱油
app.get('/', function (req, res, next) {
    res.json("isok")
});

// 跳转
app.get('/open/url', function (req, res, next) {
    // res.redirect(302, "http://" + req.query.url)
    var sql = "select * from status";
    connection.query(sql, function (err, status_data) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "操作失败!"
            })
            return;
        }
        let status_type = Number(req.query.status_type);
        // console.log(status_type)
        var sql = "select * from url";
        //查
        connection.query(sql, function (err, data) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                res.json({
                    code: 0,
                    msg: "操作失败!"
                })
                return;
            }
            if (status_type == 0 || status_type == 1) {
                var sql = "select * from url where id = " + parseInt(req.query.id);
                connection.query(sql, function (err, Adata) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        res.json({
                            code: 0,
                            msg: "操作失败!"
                        })
                        return;
                    }
                    let open_num = Adata[0].open_num;
                    // console.log(open_num)
                    var modSql = 'UPDATE url set open_num = ?  WHERE id = ?';
                    if (open_num < 0 || parseInt(open_num) == NaN) {
                        open_num = 0;
                    }
                    var modSqlParams = [open_num += 1, Adata[0].id];
                    connection.query(modSql, modSqlParams, function (err, result2) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);

                        }
                        // res.send(req.query.url)
                        open_statistics(Adata[0], 2, req.query.channel)
                        res.redirect(302, req.query.url)

                    })
                })



            } else if (status_type == 2) {
                // 指定
                var sql = "select * from appoint_url";
                //查
                connection.query(sql, function (err, appoint_data) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        res.json({
                            code: 0,
                            msg: "操作失败!"
                        })
                        return;
                    }
                    let open_num = appoint_data[0].open_num;
                    var modSql = 'UPDATE appoint_url set open_num = ?  WHERE id = ?';
                    if (open_num < 0 || parseInt(open_num) == NaN) {
                        open_num = 0;
                    }
                    var modSqlParams = [open_num += 1, appoint_data[0].id];
                    connection.query(modSql, modSqlParams, function (err, result2) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);

                        }

                        // res.send(req.query.url)
                        open_statistics(appoint_data[0], 1, req.query.channel)
                        res.redirect(302, req.query.url)

                    })
                })
            }

        })

    })
});

// 获取url
app.get('/get/url', function (req, res, next) {
    var sql = "select * from status";
    if (req.query.channel) {

    } else {
        req.query.channel = null
    }
    connection.query(sql, function (err, status_data) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "操作失败!"
            })
            return;
        }
        status_data = status_data[0];
        var sql = "select * from url";
        //查
        connection.query(sql, function (err, data) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                res.json({
                    code: 0,
                    msg: "操作失败!"
                })
                return;
            }
            if (status_data.status == 0) {
                // 随机
                let num = sum(0, data.length);
                let copy_num = data[num].copy_num;
                var modSql = 'UPDATE url set copy_num = ?  WHERE id = ?';
                if (copy_num < 0 || parseInt(copy_num) == NaN) {
                    copy_num = 0;
                }
                var modSqlParams = [copy_num += 1, data[num].id];
                connection.query(modSql, modSqlParams, function (err, result2) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);

                    }


                    data[num].copy_num += 1;
                    data[num].copy_link = `//foundjoy.ltd:${server_port}/open/url?url=${data[num].link}&id=${data[num].id}&status_type=${status_data.status}&channel=${req.query.channel}`


                    date_statistics(data[num], 2, req.query.channel);


                    res.json(data[num])
                })

            } else if (status_data.status == 1) {
                // 顺序
                let copy_num = data[status_data.sort_num].copy_num;
                var modSql = 'UPDATE url set copy_num = ?  WHERE id = ?';
                if (copy_num < 0 || parseInt(copy_num) == NaN) {
                    copy_num = 0;
                }
                var modSqlParams = [copy_num += 1, data[status_data.sort_num].id];
                connection.query(modSql, modSqlParams, function (err, result2) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);

                    }

                    status_data.sort_num += 1;
                    if (status_data.sort_num >= data.length) {
                        status_data.sort_num = 0;
                    }
                    var modSql = 'UPDATE status set sort_num = ?  WHERE id = ?';
                    var modSqlParams = [status_data.sort_num, 1];
                    connection.query(modSql, modSqlParams, function (err, result2) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);

                        }
                        data[status_data.sort_num].copy_num += 1;
                        data[status_data.sort_num].copy_link = `//foundjoy.ltd:${server_port}/open/url?url=${data[status_data.sort_num].link}&id=${data[status_data.sort_num].id}&status_type=${status_data.status}&channel=${req.query.channel}`


                        date_statistics(data[status_data.sort_num], 2, req.query.channel);


                        res.json(data[status_data.sort_num])
                    })

                })


            } else if (status_data.status == 2) {
                // 指定
                var sql = "select * from appoint_url";
                //查
                connection.query(sql, function (err, appoint_data) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        res.json({
                            code: 0,
                            msg: "操作失败!"
                        })
                        return;
                    }
                    let copy_num = appoint_data[0].copy_num;
                    var modSql = 'UPDATE appoint_url set copy_num = ?  WHERE id = ?';
                    if (copy_num < 0 || parseInt(copy_num) == NaN) {
                        copy_num = 0;
                    }
                    var modSqlParams = [copy_num += 1, appoint_data[0].id];
                    connection.query(modSql, modSqlParams, function (err, result2) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);

                        }
                        appoint_data[0].copy_num += 1;
                        appoint_data[0].copy_link = `//foundjoy.ltd:${server_port}/open/url?url=${appoint_data[0].link}&id=${appoint_data[0].id}&status_type=${status_data.status}&channel=${req.query.channel}`


                        date_statistics(appoint_data[0], 1, req.query.channel);

                        res.json(appoint_data[0])
                    })
                })
            }

        })

    })
});

// 渠道统计
app.get('/channel/data', function (req, res, next) {
    var sql = ` SELECT *  FROM appoint_url `
    connection.query(sql, function (err, appoint_data) {
        var appoint_arr = [1, 2];
        var sql = ` SELECT *  FROM channel `
        // from user表 u
        connection.query(sql, function (err, channel_data) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                res.json({
                    code: 0,
                    msg: "操作失败!"
                })
                return;
            } else {
                var sql = ` SELECT *  FROM url `
                // from user表 u
                connection.query(sql, function (err, url_data) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        res.json({
                            code: 0,
                            msg: "操作失败!"
                        })
                        return;
                    } else {
                        url_data.push(appoint_data[0]);
                        let arr = [];
                        let index = 0;
                        for (let i = 0; i < channel_data.length; i++) {
                            (function (i) {
                                for (let j = 0; j < url_data.length; j++) {
                                    (function (j) {
                                        for (var k = 0; k < appoint_arr.length; k++) {
                                            (function (k) {
                                                var sql = `select T.is_apponit,T.channel,T.url_id,
                                            (SELECT sum(open_num) FROM date_statistics WHERE url_id = T.url_id and date = '${timestampToTime(new Date() / 1000)}' and channel = '${channel_data[i].channel}' and url_id = ${url_data[j].id} and is_apponit = ${appoint_arr[k]}) as todayOpen_num, 
                                            (SELECT sum(copy_num) FROM date_statistics WHERE url_id = T.url_id and date = '${timestampToTime(new Date() / 1000)}' and channel = '${channel_data[i].channel}' and url_id = ${url_data[j].id} and is_apponit = ${appoint_arr[k]}) as todyCopy_num,
                                            (SELECT sum(open_num) FROM date_statistics WHERE url_id = T.url_id and channel = '${channel_data[i].channel}' and url_id = ${url_data[j].id} and is_apponit = ${appoint_arr[k]}) as open_num, 
                                            (SELECT sum(copy_num) FROM date_statistics WHERE url_id = T.url_id and channel = '${channel_data[i].channel}' and url_id = ${url_data[j].id} and is_apponit = ${appoint_arr[k]}) as copy_num,
                                            (SELECT link FROM ${appoint_arr[k] == 2 ? "url" : "appoint_url"}  WHERE id = T.url_id) as link
                                            from date_statistics T
                                            where channel = '${channel_data[i].channel}' and url_id = ${url_data[j].id} and is_apponit = ${appoint_arr[k]}
                                            `;
                                                // var sql = ` SELECT sum(open_num) as open_num, sum(copy_num) as copy_num,is_apponit,url_id as id,channel  FROM date_statistics where channel = '${channel_data[i].channel}' and url_id = ${url_data[j].id}`
                                                connection.query(sql, function (err, data) {
                                                    index++;
                                                    if (err) {
                                                        console.log('[SELECT ERROR] - ', err.message);
                                                        return;
                                                    } else {
                                                        if (data[0]) {
                                                            arr.push(data[0])
                                                        }
                                                        if (channel_data[i].channel == "1" && url_data[j].id == 8 && appoint_arr[k] == 2) {
                                                            console.log(sql)
                                                        }

                                                        // console.log("--------------")
                                                        // console.log(url_data.length * channel_data.length, index)
                                                        if ((url_data.length * channel_data.length * appoint_arr.length) == index) {
                                                            res.json({
                                                                code: 1,
                                                                data: arr,
                                                                msg: "操作成功"
                                                            })
                                                            return;
                                                        }
                                                    }
                                                })
                                            }(k))
                                        }
                                    }(j))

                                }
                            }(i))


                        }
                    }


                })
            }
        })
    })
})

// 后台数据渲染
app.get('/select/data', function (req, res, next) {

    var sql = `select T.id,T.link,
        (SELECT sum(open_num) FROM date_statistics WHERE url_id = T.id and is_apponit = 2 and date = '${timestampToTime(new Date() / 1000)}') as todayOpen_num, 
        (SELECT sum(copy_num) FROM date_statistics WHERE url_id = T.id and is_apponit = 2 and date = '${timestampToTime(new Date() / 1000)}') as todyCopy_num,
        (SELECT sum(open_num) FROM date_statistics WHERE url_id = T.id and is_apponit = 2) as open_num, 
        (SELECT sum(copy_num) FROM date_statistics WHERE url_id = T.id and is_apponit = 2) as copy_num 
        from url T 
        `;
    // console.log(sql)
    // var sql = "select * from url";
    //查
    connection.query(sql, function (err, data) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.json({
                code: 0,
                msg: "操作失败!"
            })
            return;
        }
        var sql = "select * from status";
        connection.query(sql, function (err, status_data) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                res.json({
                    code: 0,
                    msg: "操作失败!"
                })
                return;
            }

            // ` (SELECT sum(money) FROM pay_in_out WHERE user_id = T.id and (money_type="收入" or money_type="任务收入" or money_type="师傅收入")) as accumulated`
            var sql = `select T.id,T.link,
                (SELECT sum(open_num) FROM date_statistics WHERE url_id = T.id and is_apponit = 1 and date = '${timestampToTime(new Date() / 1000)}') as appoint_url_todayOpen_num, 
                (SELECT sum(copy_num) FROM date_statistics WHERE url_id = T.id and is_apponit = 1 and date = '${timestampToTime(new Date() / 1000)}') as appoint_url_todyCopy_num ,
                (SELECT sum(open_num) FROM date_statistics WHERE url_id = T.id and is_apponit = 1) as open_num, 
                (SELECT sum(copy_num) FROM date_statistics WHERE url_id = T.id and is_apponit = 1) as copy_num 
                from appoint_url T 
                `;
            console.log(sql)
            // var sql = "select * from appoint_url";
            connection.query(sql, function (err, appoint_url) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "操作失败!"
                    })
                    return;
                }
                res.json({
                    code: 1,
                    status: status_data[0].status,
                    data: data,
                    appoint_url: appoint_url[0],
                    msg: "操作成功"
                })
            })
        })

    })
})

// 删除数据
app.post('/del/data', function (req, res, next) {
    var sql = 'DELETE FROM url where id = ' + Number(req.body.id);
    console.log(req.body.id)
    //增
    connection.query(sql, function (err, data) {
        if (err) {
            res.json({
                code: 0,
                msg: "删除成功"
            })
            console.log('[DELETE ERROR] - ', err.message);
            return
        }
        res.json({
            code: 1,
            msg: "删除成功"
        })

    })
});

// 添加数据
app.post('/add/data', function (req, res, next) {

    var addSql = 'INSERT INTO url(link) VALUES(?)';
    var addSqlParams = [""];
    //增
    connection.query(addSql, addSqlParams, function (err, result) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);

        }
        res.json({
            code: 1,
            data: result,
            msg: "操作成功"
        })

    })
});

// 保存数据
app.post('/save/data', function (req, res, next) {
    if (req.body.value) {
        req.body.value = JSON.parse(req.body.value)
        if (req.body.appoint) {
            req.body.appoint = JSON.parse(req.body.appoint)
        }
        for (var i = 0; i < req.body.value.length; i++) {
            (function (i) {
                var modSql = 'UPDATE url set link = ?  WHERE id = ?';
                var modSqlParams = [req.body.value[i].value, req.body.value[i].id];
                //增
                connection.query(modSql, modSqlParams, function (err, result2) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);

                    }
                })
            }(i))
        }
        // console.log(req.body.appoint.value)
        var modSql = 'UPDATE appoint_url set link = ?  WHERE id = ?';
        var modSqlParams = [req.body.appoint.value, 1];
        //增
        connection.query(modSql, modSqlParams, function (err, result2) {
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);

            }
        })

        var modSql = 'UPDATE status set status = ?  WHERE id = ?';
        var modSqlParams = [Number(req.body.type), 1];
        connection.query(modSql, modSqlParams, function (err, hh) {
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                return;
            }
            res.json({
                code: 1,
                msg: "操作成功"
            })

        })
    }
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

// 随机数
function sum(m, n) {
    var num = Math.floor(Math.random() * (m - n) + n);
    return num;
}

// 拷贝日期统计
function date_statistics(data, is_apponit, channel) {

    var sql = `select * from date_statistics where date = '${timestampToTime(new Date() / 1000)}' and url_id = ${data.id} and is_apponit = ${is_apponit} and channel = '${channel}'`;
    // console.log(sql)
    connection.query(sql, function (err, statistics) {
        if (err) {
            console.log('[select ERROR] - ', err.message);

        } else {
            if (statistics.length > 0) {
                let statistics_copy_num = statistics[0].copy_num;
                if (statistics_copy_num < 0 || parseInt(statistics_copy_num) == NaN) {
                    statistics_copy_num = 0;
                } else {
                    statistics_copy_num += 1;
                }
                var modSql = 'UPDATE date_statistics set copy_num = ?  WHERE date = ? and url_id = ? and is_apponit = ? and channel = ?';
                var modSqlParams = [statistics_copy_num, timestampToTime(new Date() / 1000), data.id, is_apponit, channel];
                connection.query(modSql, modSqlParams, function (err, result2) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);

                    }
                })

            } else {
                var sql = `select * from channel where channel='${channel}'`
                // console.log(sql)
                connection.query(sql, function (err, channel_data) {
                    if (err) {
                        console.log('[select ERROR] - ', err.message);

                    } else {
                        if (channel_data.length > 0) {
                            next_step();
                        } else {
                            var addSql = 'INSERT INTO channel(channel) VALUES(?)';
                            var addSqlParams = [channel];
                            //增
                            connection.query(addSql, addSqlParams, function (err, result) {
                                if (err) {
                                    console.log('[INSERT ERROR] - ', err.message);

                                }
                                next_step();

                            })
                        }

                        function next_step() {
                            var addSql = 'INSERT INTO date_statistics(date,open_num,copy_num,is_apponit,url_id,channel) VALUES(?,?,?,?,?,?)';
                            var addSqlParams = [timestampToTime(new Date() / 1000), 0, 1, is_apponit, data.id, channel];
                            //增
                            connection.query(addSql, addSqlParams, function (err, result) {
                                if (err) {
                                    console.log('[INSERT ERROR] - ', err.message);

                                }

                            })
                        }
                    }
                })

            }
        }
    })
}

// 打开链接日期统计
function open_statistics(data, is_apponit, channel) {

    var sql = `select * from date_statistics where date = '${timestampToTime(new Date() / 1000)}' and url_id = ${data.id} and is_apponit = ${is_apponit} and channel = '${channel}'`;
    // console.log(sql)
    connection.query(sql, function (err, statistics) {
        if (err) {
            console.log('[select ERROR] - ', err.message);

        } else {
            if (statistics.length > 0) {

                let statistics_open_num = statistics[0].open_num;
                if (statistics_open_num < 0 || parseInt(statistics_open_num) == NaN) {
                    statistics_open_num = 0;
                } else {
                    statistics_open_num += 1;
                }
                var modSql = 'UPDATE date_statistics set open_num = ?  WHERE date = ? and url_id = ? and is_apponit = ? and channel = ?';
                var modSqlParams = [statistics_open_num, timestampToTime(new Date() / 1000), data.id, is_apponit, channel];
                connection.query(modSql, modSqlParams, function (err, result2) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);

                    }
                })

            }
        }
    })
}