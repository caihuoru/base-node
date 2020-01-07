// 查询订单
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
// 发起支付
app.post('/', function (req, res, next) {
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
        wap = alipay.wap(wapOrdera) // 此方法返回Promise
        wap.then(function (wap) {
            console.log(wap)
            var url = urlEncode(wap.payload)
            url = "https://openapi.alipay.com/gateway.do?" + url;
            res.json({
                code: 1,
                data: {
                    url: url,
                    order: wapOrder[0].out_trade_no
                },
                msg: "成功"
            })
        })
    })
});
// 任务再支付
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

// 支付回调
app.post('/notify', (req, res) => {
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

// 前端返回
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
