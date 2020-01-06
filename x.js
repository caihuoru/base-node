const express = require("express");
const querystring = require("querystring");
var mysql = require('mysql');
var app = express();


app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//post请求需要
// app.post('*', function (req, res, next) {
//     var postData = '';
//     req.on('data', function (chunk) {
//         postData += chunk;
//     });
//     req.on('end', function () {
//         postData = decodeURI(postData);
//         if(postData.indexOf('}') > -1){
//             postData = JSON.parse(postData)
//         }else{
//             postData = querystring.parse(postData)
//         }
//         req.body=postData;
//         next();
//     })
// });
//数据库配置
const mysqlConfig = {
    host: '39.108.10.188',
    user: 'root',
    password: '123456',
    port: '3306',
    database: "wall",
    useConnectionPooling: true
}
var connection = mysql.createPool(mysqlConfig);
app.listen(8091);



// 提现审核查询
app.get('/withdrawllReviewwall', (req, res) => {
    var sql = "select withdraw.*,user_manage.accounts_receivable,user_manage.payment_account,user_manage.account_number from withdraw inner join user_manage on withdraw.user_id=user_manage.id and withdraw.audit_status!='不通过' and withdraw.audit_status!='审核驳回' and withdraw.with_status!='已提现'";
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
            var modSql = 'UPDATE withdraw SET audit_status = ?, reason_rejection = ?, with_status = ? WHERE id = ?';
            var modSqlParams = [postData.audit_status, postData.reason_rejection, "已提现", postData.id];
        } else if (postData.audit_status == "审核驳回") {
            var modSql = 'UPDATE withdraw SET audit_status = ?, reason_rejection = ?, with_status = ? WHERE id = ?';
            var modSqlParams = [postData.audit_status, postData.reason_rejection, "未提现", postData.id];
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
                            var modSqlParams = [withdraw_money, Data[0].pay_remain += postData.money, postData.user_id];
                        } else {
                            var modSql = 'UPDATE user_manage SET withdraw_money = ?, cash_remain = ? WHERE id = ?';
                            var modSqlParams = [withdraw_money, Data[0].cash_remain += postData.money, postData.user_id];
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


// 2019-8-1
// 用户管理
app.get('/UserManagerwall', (req, res) => {
    var sql = `SELECT 
    T.*,
    (SELECT count(teacher_id) FROM user_manage WHERE teacher_id = T.id) as student_number,
    (SELECT account_number FROM user_manage WHERE id = T.teacher_id) as teacher_name,
    (SELECT sum(money) FROM pay_in_out WHERE user_id = T.id and (money_type="收入" or money_type="任务收入" or money_type="师傅收入")) as accumulated
  FROM 
    user_manage T
    ORDER BY T.id DESC`;

    connection.query(sql, function (err, Data) {
        if (err) {
            res.json({
                code: 0,
                msg: "数据错误"
            })
            console.log(err)
            return;
        }
        Data = JSON.parse(JSON.stringify(Data).replace(/account_number/g, "account"));

        Data = JSON.parse(JSON.stringify(Data).replace(/teacher_name'/g, "accumulated'"));

        res.json({
            code: 1,
            list: Data,
            msg: "成功"
        })

    })

})

// 徒弟详情
app.get('/students_wall', (req, res) => {
    var sql = "SELECT a.*,b.all_money FROM `user_manage` as a ";
    sql += `
        LEFT JOIN (SELECT sum(back_teacher_money) as all_money,user_id FROM task_audit group by user_id) as b
        on a.id=b.user_id
        where teacher_id = `+ req.query.id + `
        ORDER BY a.id DESC`;
    connection.query(sql, function (err, Data) {
        if (err) {
            res.json({
                code: 0,
                msg: "数据错误"
            })
            console.log(err)
            return;
        }
        res.json({
            code: 1,
            list: Data,
            msg: "成功"
        })
    })
})

// 删除和编辑
app.post('/Userpagewall', (req, res) => {
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
        // 删除
        if (postData.doing == "Delete") {
            var sql = "delete from user_manage where id = " + postData.id;
            connection.query(sql, function (err, Data) {
                if (err) {
                    res.json({
                        code: 0,
                        msg: "数据错误"
                    })
                    console.log(err)
                    return;
                }
                res.json({
                    code: 1,
                    msg: "删除成功"
                })
            })
        } else if (postData.doing == "Edit") {
            var modSql = 'UPDATE user_manage SET user_nickName = ?, pass_word = ?, alipay = ?, wechat = ? WHERE id = ?';
            var modSqlParams = [postData.user_nickName, postData.password, postData.alipay, postData.wechat, postData.id];
            connection.query(modSql, modSqlParams, function (err, backData) {
                if (err) {
                    console.log(err)
                    res.json({
                        status: 0,
                        msg: "修改失败"
                    })
                    return;
                }
                res.json({
                    code: 1,
                    msg: "编辑成功"
                })

            })
        }
    })
})


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