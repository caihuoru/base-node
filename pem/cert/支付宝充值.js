// 充值发起
app.post('/', function (req, res, next) {
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
            subject: '积分墙在线充值'

        }

        const wapOrder = {
            out_trade_no: payObj.order_number,
            total_amount: payObj.money, // 单位 元
            subject: '积分墙在线充值'
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
                    order: wapOrder.out_trade_no
                },
                msg: "成功"
            })
        })
    })
});
// 支付回调
app.post('/notify', (req, res) => {
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

                if (!userData[0].pay_remain) {
                    userData[0].pay_remain = 0;
                }
                var modSql = 'UPDATE user_manage SET pay_remain = ? WHERE id = ?';
                var allMoney = parseFloat(userData[0].pay_remain) + parseFloat(req.body.total_amount);
                var modSqlParams = [allMoney, orderData.userid];
                console.log("最新金额：" + allMoney)
                connection.query(modSql, modSqlParams, function (err, UPdata) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    var addSql = 'INSERT INTO pay_in_out(user_id,s_date,money,money_type,info) VALUES(?,?,?,?,?)';
                    var addSqlParams = [orderData.userid, timestampToTime(new Date() / 1000, true), parseFloat(req.body.total_amount), "充值", "支付宝充值" + req.body.total_amount + "元"];

                    connection.query(addSql, addSqlParams, function (err, backData) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);
                            return;
                        }

                    })
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

// 前端返回
app.get('/return', (req, res) => {
    if (alipay.verify(req.query)) { // 验签
        console.log(req.query)
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