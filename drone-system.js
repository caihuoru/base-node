module.exports = function (app, connection, fs, path, jwt) {

    app.get('/situation/data', (req, res) => {
        var sql = `select * from link_url `;

        //查
        connection.query(sql, function (err, result) {
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                res.json({
                    code: 0,
                })
                return;
            }
            res.json({
                code: 1,
                data: result,
            })
        })

    })
    app.post('/edit/situation', (req, res) => {
        var modSql = 'UPDATE link_url SET newLink = ?,status=? WHERE id= 1';
        var modSqlParams = [req.body.newLink, Number(req.body.status)];
        //添加vip
        connection.query(modSql, modSqlParams, function (err, UPdata) {
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                res.json({
                    code: 0,
                    msg: "失败"
                })
                return;
            }
            res.json({
                code: 1,
                data: UPdata,
                msg: "成功"
            })
        })

    })
    // 后台用户查询
    app.get('/system/user', function (req, res, next) {
        req.query.size = req.query.length || 10;
        req.query.index = req.query.start / 10 || 1;
        var value = req.query.search.value;


        var sql_add = "";
        var sql_num = 0;
        for (var i = 0; i < req.query.columns.length; i++) {
            if (req.query.columns[i].search.value) {
                if (sql_num == 0) {
                    sql_add += "where ";
                }
                sql_add += ` ${req.query.columns[i].data} like  '%${req.query.columns[i].search.value}%' and `
                sql_num++;
            }
        }
        sql_add = sql_add.substr(0, sql_add.length - 4);

        if (value) {
            var sql = `select * from wrj_user WHERE CONCAT(IFNULL(id,''),IFNULL(Identification,''),IFNULL(name,''),IFNULL(icon,''),IFNULL(money,''),IFNULL(expiretime,''),IFNULL(sex,'')) like '%${value}%' order by ${req.query.columns[req.query.order[0].column].data} ${req.query.order[0].dir}  limit ${req.query.start},${req.query.size}`;
        } else {
            var sql = `select * from wrj_user ${sql_add} order by ${req.query.columns[req.query.order[0].column].data} ${req.query.order[0].dir} limit ${req.query.start},${req.query.size}`;
        }
        connection.query(sql, function (err, userData) {
            if (err) {
                res.json({
                    code: 0,
                    data: [],
                    // value: sql_add,
                    msg: "查询失败"
                })
                return false;
            } else {
                var COUNT = `SELECT COUNT(*) as total FROM wrj_user ${sql_add}`;
                connection.query(COUNT, function (err, num) {
                    if (err) {
                        console.log(err)
                        res.json({
                            code: 0,
                            msg: "未知错误"
                        })
                        return;
                    }
                    // console.log(num)
                    let total = Math.ceil(num[0].total / req.query.size);

                    res.json({
                        code: 1,
                        data: userData,
                        recordsTotal: num[0].total,
                        recordsFiltered: num[0].total,
                        draw: req.query.draw,
                        value: req.query,
                        msg: "成功"
                    })
                })
            }
        })
    })

    // 后台用户编辑
    app.post('/system/user/edit', function (req, res, next) {
        var sql = `UPDATE wrj_user SET money = ${Number(req.body.money)}, name = '${req.body.name}' , sex = ${req.body.sex} WHERE id = ${Number(req.body.id)}`;
        connection.query(sql, function (err, userData) {
            console.log(err)
            if (err) {
                res.json({
                    code: 0,
                    msg: "失败"
                })
                return false;
            } else {
                res.json({
                    code: 1,
                    msg: "成功"
                })
            }
        })
    })
    // 后台标签查询
    app.get('/system/label', function (req, res, next) {
        var sql = `select T.* ,
        (SELECT name FROM wrj_user WHERE id = T.userId) as userName
        from wrj_label T 
        order by id desc
        `
        connection.query(sql, function (err, userData) {
            if (err) {
                res.json({
                    code: 0,
                    data: [],
                    msg: "查询失败"
                })
                return false;
            } else {
                res.json({
                    code: 1,
                    data: userData,
                    msg: "查询成功"
                })
            }
        })
    })
    // 后台标签删除
    app.post('/system/label/del', function (req, res, next) {
        var index = parseInt(req.body.id);
        var sql = 'DELETE FROM wrj_label where id = ' + index;
        connection.query(sql, function (err, userData) {
            if (err) {
                res.json({
                    code: 0,
                    data: [],
                    msg: "查询失败"
                })
                return false;
            } else {
                res.json({
                    code: 1,
                    data: userData,
                    msg: "查询成功"
                })
            }
        })
    })
    // 支付宝VIP返回
    app.get('/vipReturn', function (req, res, next) {
        res.json({
            code: 1,
            msg: "返回"
        })
    })

    // ios-VIP回调
    app.post('/ios/vipReturn', function (req, res, next) {
        // let isVip = req.body.latest_receipt_info.is_trial_period == "true" ? 2 : 1;
        let isVip = 1;
        var sql = `select * from wrj_iosPaper where original_transaction_id = ${req.body.latest_receipt_info.original_transaction_id}`;
        connection.query(sql, function (err, iosOrder) {
            if (err || iosOrder.length === 0) {
                res.json({
                    code: 0,
                    data: [],
                    msg: "查询失败"
                })
                return false;
            }
            var day = 86400;
            console.log(iosOrder[0].userId)
            // 初次购买
            if (req.body.notification_type === "INITIAL_BUY") {
                // var info = latest_receipt_info.expires_date

                console.log(timestampToTime(req.body.latest_receipt_info.expires_date / 1000))
                // console.log(timestampToTime(1577806275000 / 1000))
                var modSql = 'UPDATE wrj_user SET isvip = ? , expiretime = ?  WHERE id = ?';
                var modSqlParams = [isVip, timestampToTime(req.body.latest_receipt_info.expires_date / 1000), iosOrder[0].userId];
                //添加vip
                connection.query(modSql, modSqlParams, function (err, UPdata) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    res.send({
                        code: 1,
                        msg: "续费成功"
                    })
                })
            }
            // 更改或取消购买
            else if (req.body.notification_type === "CANCEL") {
                var sql = `select * from wrj_user WHERE id =  ${iosOrder[0].userId}`;
                // req.body.latest_receipt_info[0].transaction_id
                connection.query(sql, function (err, userData) {
                    if (err || userData.length === 0) {
                        if (err) {
                            console.log(err.message);
                            return;
                        }
                        res.json({
                            code: 0,
                            data: [],
                            msg: "查询失败"
                        })
                        return false;
                    }
                    userData = userData[0];
                    var time = Date.parse(new Date());
                    // console.log(time)
                    // console.log(req.body.latest_receipt_info.expires_date)
                    if (req.body.latest_receipt_info.expires_date >= time) {
                        var modSql = 'UPDATE wrj_user SET isvip = ? , expiretime = ?  WHERE id = ?';
                        var modSqlParams = [isVip, timestampToTime(req.body.latest_receipt_info.expires_date / 1000), iosOrder[0].userId];
                    } else {
                        var modSql = 'UPDATE wrj_user SET isvip = ? , expiretime = ?  WHERE id = ?';
                        var modSqlParams = [0, null, iosOrder[0].userId];
                    }

                    //添加vip
                    connection.query(modSql, modSqlParams, function (err, UPdata) {
                        if (err) {
                            console.log('[UPDATE ERROR] - ', err.message);
                            return;
                        }
                        res.send({
                            code: 1,
                            msg: "续费成功"
                        })
                    })

                })
            }
            // 改变下次购买（当前不变）
            else if (req.body.notification_type == "DID_CHANGE_RENEWAL_PREF") {
                res.send({
                    code: 1,
                    msg: ""
                })

            }
            // 因为记账没能继续购买
            else if (req.body.notification_type == "DID_FAIL_TO_RENEW") {
                res.send({
                    code: 1,
                    msg: ""
                })

            }
            // 指示过去未能续订的过期订阅的自动成功更新
            else if (req.body.notification_type == "DID_RECOVER") {
                var modSql = 'UPDATE wrj_user SET isvip = ? , expiretime = ?  WHERE id = ?';
                var modSqlParams = [isVip, timestampToTime(req.body.latest_receipt_info.expires_date / 1000), iosOrder[0].userId];
                //添加vip
                connection.query(modSql, modSqlParams, function (err, UPdata) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    res.send({
                        code: 1,
                        msg: "续费成功"
                    })
                })

            }
            // 指示客户通过使用应用程序的界面或在应用程序的订阅设置中的AppStore中交互地更新订阅。立即提供服务。
            else if (req.body.notification_type == "INTERACTIVE_RENEWAL") {
                var modSql = 'UPDATE wrj_user SET isvip = ? , expiretime = ?  WHERE id = ?';
                var modSqlParams = [isVip, timestampToTime(req.body.latest_receipt_info.expires_date / 1000), iosOrder[0].userId];
                //添加vip
                connection.query(modSql, modSqlParams, function (err, UPdata) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    res.send({
                        code: 1,
                        msg: "续费成功"
                    })
                })
            }
            // 表示成功的自动续订过期的订阅
            else if (req.body.notification_type == "RENEWAL") {
                var modSql = 'UPDATE wrj_user SET isvip = ? , expiretime = ?  WHERE id = ?';
                var modSqlParams = [isVip, timestampToTime(req.body.latest_receipt_info.expires_date / 1000), iosOrder[0].userId];
                //添加vip
                connection.query(modSql, modSqlParams, function (err, UPdata) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    res.send({
                        code: 1,
                        msg: "续费成功"
                    })
                })
            }
            // 重新购买
            else if (req.body.notification_type === "DID_CHANGE_RENEWAL_STATUS") {
                var modSql = 'UPDATE wrj_user SET isvip = ? , expiretime = ?  WHERE id = ?';
                var modSqlParams = [isVip, timestampToTime(req.body.latest_receipt_info.expires_date / 1000), iosOrder[0].userId];
                //添加vip
                connection.query(modSql, modSqlParams, function (err, UPdata) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                    res.send({
                        code: 1,
                        msg: "续费成功"
                    })
                })
                // if (req.body.latest_receipt_info) {



                //     var sql = `select * from wrj_user WHERE id =  ${iosOrder[0].userId}`;
                //     // req.body.latest_receipt_info[0].transaction_id
                //     connection.query(sql, function (err, userData) {
                //         if (err || userData.length === 0) {
                //             if (err) {
                //                 console.log(err.message);
                //                 return;
                //             }
                //             res.json({
                //                 code: 0,
                //                 data: [],
                //                 msg: "查询失败"
                //             })
                //             return false;
                //         }
                //         var body = req.body;
                //         userData = userData[0];
                //         var timestamp = body.latest_receipt_info[0].expires_date_ms / 1000;
                //         var time = Date.parse(userData.expiretime);
                //         time = (time / 1000) - timestamp;
                //         if (time == null || !time || time <= 0 || time == NaN) {
                //             if (body.latest_receipt_info[0].product_id == "DronesMapPay_YearVip") {
                //                 timestamp = timestampToTime(timestamp + (day * 365));
                //             } else if (body.latest_receipt_info[0].product_id == "DronesMapPay_MonthVip") {
                //                 timestamp = timestampToTime(timestamp + (day * 30));
                //             } else {
                //                 res.json({
                //                     code: 0,
                //                     msg: "失败"
                //                 })
                //                 return false;
                //             }
                //         } else {
                //             if (body.latest_receipt_info[0].product_id == "DronesMapPay_YearVip") {
                //                 timestamp = timestampToTime(timestamp + (day * 365) + time);
                //             } else if (body.latest_receipt_info[0].product_id == "DronesMapPay_MonthVip") {
                //                 timestamp = timestampToTime(timestamp + (day * 30) + time);
                //             } else {
                //                 res.json({
                //                     code: 0,
                //                     msg: "失败"
                //                 })
                //                 return false;
                //             }
                //         }
                //         console.log(timestamp)
                //         var modSql = 'UPDATE wrj_user SET isvip = ? , expiretime = ?  WHERE id = ?';
                //         var modSqlParams = [1, timestamp, iosOrder[0].userId];
                //         //添加vip
                //         connection.query(modSql, modSqlParams, function (err, UPdata) {
                //             if (err) {
                //                 console.log('[UPDATE ERROR] - ', err.message);
                //                 return;
                //             }
                //             res.send({
                //                 code: 1,
                //                 msg: "续费成功"
                //             })
                //         })
                //     })


                // } else {
                //     res.json({
                //         code: 0,
                //         msg: "error"
                //     })
                // }
            } else {
                res.json({
                    code: 0,
                    msg: "error"
                })
            }
            var file = path.join(__dirname, `data/${Date.parse(new Date()) / 1000}appStore.json`);

            // 写入文件
            fs.writeFile(file, JSON.stringify(req.body), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log('文件创建成功，地址：' + file);
            });

        })
    })
    //微信登录注册
    app.post('/third/login', function (req, res, next) {
        console.log(req.body)
        var Identification = req.body.uid;
        if (!Identification) {
            res.json({
                code: 0,
                msg: "id不能为空"
            })
            return false;
        }
        if (!req.body.type) {
            res.json({
                code: 0,
                msg: "类型不能为空"
            })
            return false;
        }
        let type = parseInt(req.body.type);
        if (req.body.type == 1) {
            var name = req.body.name || "微信用户";
            var sql = "select * from wrj_user where wechat_id = '" + Identification + "'";
            var addSql = 'INSERT INTO wrj_user(wechat_id,name,token,icon,registered_type) VALUES(?,?,?,?,?)';
        } else if (req.body.type == 2) {
            var name = req.body.name || "qq用户";
            var sql = "select * from wrj_user where qq_id = '" + Identification + "'";
            var addSql = 'INSERT INTO wrj_user(qq_id,name,token,icon,registered_type) VALUES(?,?,?,?,?)';
        } else {
            var name = req.body.name || "第三方用户";
            var sql = "select * from wrj_user where alipay_id = '" + Identification + "'";
            var addSql = 'INSERT INTO wrj_user(alipay_id,name,token,icon,registered_type) VALUES(?,?,?,?,?)';
        }

        var icon = req.body.icon || null;


        //查
        connection.query(sql, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                res.json({
                    code: 0,
                    msg: "未知错误"
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
                    'expiresIn': 60 * 60 * 24 * 30 // 设置过期时间, 一个月
                })

                var addSqlParams = [Identification, name, token_, icon, type];
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
                    code: 1,
                    data: {
                        use_id: result[0].id,
                        userName: result[0].name,
                        isVip: result[0].isVip,
                        expiretime: result[0].expiretime,
                        icon: result[0].icon,
                        token: result[0].token,
                        sex: result[0].sex,
                        type: 'login',
                        money: result[0].money
                    },
                    msg: "登录成功"
                })
            }
        });
    })
}




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