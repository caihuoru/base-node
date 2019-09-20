let os = require('os');//这个nodejs模块，会帮助我们获取本机ip
module.exports = function (app) {
    var mysql = require('mysql');
    let crypto = require('crypto');
    let querystring = require('querystring');
    var request = require('request');
    // app.use(bodyParser.urlencoded({extended: false}));
    let db_config = {
        host: '39.108.10.188',       //主机
        // host: 'localhost',       //主机
        user: 'root',            //MySQL认证用户名
        password: '123456',
        port: '3306',
        database: 'wall'
    };
    let connection;
    const schedule = require('node-schedule');
    const scheduleCronstyle = () => {
        //每分钟的第30秒定时执行一次:
        schedule.scheduleJob('30 * * * * *', () => { // 秒 分 时 日 月 周
            Automatic()
        });
    }
    scheduleCronstyle();

    function handleDisconnect() {
        connection = mysql.createPool(db_config);
        connection.getConnection(function (err) {
            if (err) {
                console.log('进行断线重连：' + new Date());
                setTimeout(handleDisconnect, 2000);   //2秒重连一次
                return;
            }
            console.log('数据库连接成功');
        });
        connection.on('error', function (err) {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                handleDisconnect();
            } else {
                throw err;
            }
        });
    }

    handleDisconnect();

    app.all('*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By", ' 3.2.1')
        res.header("Content-Type", "application/json;charset=utf-8");
        next();
    });
    // 查询未读消息
    app.get('/getUnreadMessages', function (req, res, next) {
        let token = req.query.token;
        connection.query(
            `SELECT
                count( * ) AS number,
                (
                SELECT
                count( * ) 
                FROM
                ( SELECT * FROM task_audit WHERE user_id = ( SELECT id FROM user_manage WHERE token = "${token}" ) AND audit_status = "已驳回" AND task_status = "待审核" ) b 
                ) AS isReject,
                (
                SELECT
                count( * ) 
                FROM
                ( SELECT * FROM task_audit WHERE issuer_id = ( SELECT account_number FROM user_manage WHERE token = "${token}" ) AND audit_status = "审核中" AND task_status = "待审核" ) c 
                ) AS unAudit 
            FROM
                ( SELECT NAME FROM chat_record WHERE toUser = ( SELECT account_number FROM user_manage WHERE token = "${token}" ) AND unread = 1 GROUP BY NAME ) a`,
            function (err, result) {
                // console.log('getUnreadMessages',err, result)
                if (result) {
                    res.send({
                        code: 1,
                        msg: '查询成功',
                        body: result[0]
                    })
                }
            }
        )
    })
    // 查询我的推荐人
    app.get('/getMyReferrer', function (req, res) {
        let token = req.query.token;
        connection.query(
            'SELECT account_number FROM user_manage WHERE id =( SELECT teacher_id FROM user_manage WHERE token = ?)',
            [token],
            function (err, result) {
                if (result) {
                    res.send({
                        code: 1,
                        msg: '查询成功',
                        referrer: result[0].account_number
                    })
                }

            }
        )
        console.log(token)
    })
    // 查询我的消息
    app.get('/getMyMessages', function (req, res, next) {
        let token = req.query.token;
        connection.query(
            'SELECT *,max(time) as last_time,max(unread) as last_unread FROM chat_record WHERE toUser = (SELECT account_number FROM user_manage WHERE token = ?) GROUP BY name',
            [token],
            function (err, result) {
                // console.log('getMyMessages',err, result)
                if (result) {
                    res.send({
                        code: 1,
                        msg: '查询成功',
                        list: result
                    })
                }
            }
        )
    })

    // 接取任务
    // 下载app类
    app.get('/taketask_wall', function (req, res, next) {
        let queryData = req.query;
        console.log(queryData);
        connection.query(
            `
            SELECT
                T.*,
                ( T.task_number / 100 * ( SELECT task_scale FROM platform_settings LIMIT 0, 1 ) ) AS scale,
                ( SELECT count(*) as count FROM task_audit WHERE task_id = T.id and task_status != "任务失败" and new_old_logo = 1) as oldUser
            FROM
                task_list T 
            WHERE
                id = ?
            `,
            [queryData.taskid],
            function (err, result) {
                // console.log('taskInfo',err, result)
                let taskInfo = result[0];
                if (taskInfo.task_status == '已取消') {
                    res.send({
                        code: '0',
                        msg: '该任务已取消'
                    })
                } else if (taskInfo.task_status == '已完成' || taskInfo.task_status == '已结束') {
                    res.send({
                        code: '0',
                        msg: '该任务已结束'
                    })
                } else if (taskInfo.task_status == '暂停') {
                    res.send({
                        code: '0',
                        msg: '该任务已被发布者暂停'
                    })
                } else if (taskInfo.task_status == '进行中') {
                    getUserInfo(queryData.token, function (callbackData) {
                        // 获取成功无code
                        if (callbackData.length > 0) {
                            // 用户信息
                            let userInfo = callbackData[0];
                            if (userInfo.new_old_logo == 1) {
                                if (taskInfo.oldUser >= parseInt(taskInfo.scale)) {
                                    res.send({
                                        code: 'task no remain',
                                        msg: '任务已被接取完'
                                    })
                                    console.log(taskInfo.id + ' 老用户可接任务已达上限')
                                    return false
                                }
                            }
                            connection.query(
                                'SELECT * FROM task_audit WHERE task_id = ? and user_id = ?',
                                [queryData.taskid, userInfo.id],
                                function (err, result) {
                                    if (result.length > 0) {
                                        res.send({
                                            code: 'task have done',
                                            msg: '任务已做过'
                                        })
                                    } else {
                                        taskAutomatic(queryData.taskid, function (n) {
                                            if (n < taskInfo.task_number) {
                                                let task_time;
                                                switch (taskInfo.time_unit) {
                                                    case "分钟":
                                                        task_time = parseInt(taskInfo.task_time) * 60 * 1000
                                                        break
                                                    case "小时":
                                                        task_time = parseInt(taskInfo.task_time) * 60 * 60 * 1000
                                                        break
                                                    case "天":
                                                        task_time = parseInt(taskInfo.task_time) * 24 * 60 * 60 * 1000
                                                        break
                                                }
                                                let insert = {
                                                    task_id: taskInfo.id,
                                                    user_id: userInfo.id,
                                                    task_money: taskInfo.task_amount,
                                                    limit_time: getDateString(new Date().getTime() + task_time),
                                                    issuer_id: taskInfo.announcer,
                                                    task_status: '进行中',
                                                    udid: queryData.udid,
                                                    take_task_time: getDateString(),
                                                }
                                                let { keys, defalut, values } = getInsertData(insert);
                                                // console.log(keys,values,defalut)
                                                connection.query(
                                                    'insert into task_audit(' + keys + ') values(' + defalut + ')',
                                                    values,
                                                    function (err, result) {
                                                        console.log(err, result)
                                                        if (result) {
                                                            res.send({
                                                                code: 'success',
                                                                msg: '任务接取成功'
                                                            })
                                                        }
                                                    }
                                                )
                                            } else {
                                                res.send({
                                                    code: 'task no remain',
                                                    msg: '任务已被接取完'
                                                })
                                            }
                                        })
                                    }
                                }
                            )
                        } else {
                            res.send({
                                code: 'fail',
                                msg: '找不到token'
                            })
                        }
                    })
                }
            }
        )
    })
    // 提交审核
    /**新添加的逻辑
     * 用户每次提交审核的时候都要将提交的数据存到submit_recode,当submit_recode的长度等于5时，就不允许继续提交，
     * 将提示提交次数太多，不允许提交
     *管理后台的客服介入，审核的依据也将根据次字段定夺
     */
    app.post('/submittask_wall', function (req, res, next) {
        console.log('start:' + new Date().getTime())
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
            console.log('data:%o', postData)
            getTaskAuditInfo(postData.jsondata.taskid, postData.jsondata.token, function (callbackData) {
                console.log('result1:' + new Date().getTime())
                // 获取成功无code
                if (callbackData.length > 0) {
                    // 审核信息
                    let taskAuditInfo = callbackData[0];
                    // 如果当前时间大于任务完成时间 =》 判断任务失败
                    if (new Date(taskAuditInfo.limit_time) < new Date() && taskAuditInfo.task_status != '待审核') {
                        res.send({
                            code: 'task over time',
                            msg: '任务完成超时'
                        })
                        if (taskAuditInfo.task_status == '进行中') {
                            connection.query(
                                'update task_audit set task_status = "任务失败" where task_id = ? and user_id = ?',
                                [taskAuditInfo.task_id, taskAuditInfo.user_id],
                                function (err, result) {
                                    console.log('任务超时失败')
                                }
                            )
                        }
                    } else {
                        if (!taskAuditInfo.submit_time || taskAuditInfo.submit_time == '' || postData.pagename == 'review') {//最后一个条件代表重新提交
                            connection.query(
                                'update task_audit set submit_time = now(),submit_content = ?,submit_recode = ?,audit_status = "审核中",task_status = "待审核",audit_time = ? where task_id = ? and user_id = ?',
                                [postData.jsondata.submit_content, postData.jsondata.submit_recode, getDateString(new Date().getTime() + parseInt(taskAuditInfo.task_time) * 60 * 60 * 1000), taskAuditInfo.task_id, taskAuditInfo.user_id],
                                function (err, result) {
                                    // console.log("postData.pagename == 'review'",err, result)
                                    if (err) {
                                        res.send({
                                            code: 'error',
                                            msg: '提交失败'
                                        })
                                    }
                                    res.send({
                                        code: 'success',
                                        msg: '提交成功'
                                    })
                                }
                            )
                        } else {
                            res.send({
                                code: 'submit too more',
                                msg: '重复提交'
                            })
                        }
                    }
                } else {
                    res.send({
                        code: 'fail',
                        msg: '找不到token'
                    })
                }

            })
        })
    })

    /* 接口说明
    * 功能：查询举报信息
    * 返回值：数组[]
    * */
    app.get('/queryJuBao', function (req, res, next) {
        connection.query("select a.*,u.account_number from accuse a left join user_manage u on a.accused_id=u.id",
            function (err, result) {
                if (err) {
                    console.log(err.message)
                    res.json({
                        code: 0,
                        msg: err.message
                    })
                    return;
                }
                res.json({
                    code: 1,
                    data: result,
                    msg: '查询成功'
                })
                console.log(result)
            })
    })

    /* 接口说明
    * 功能：查询任务投诉列表
    * 返回值：数组[]
    * */
    app.get('/queryTouSu', function (req, res) {
        connection.query("select *,(select task_type  from task_list  where id = ts.task_id) as task_type,(select task_step from task_list where id = ts.task_id) as task_step from task_tousu  ts", function (err, result) {
            if (err) {
                console.log(err.message)
                res.json({
                    code: 0,
                    msg: '查询错误'
                })
                return;
            }
            console.log(result)
            res.json({
                code: 1,
                data: result,
                msg: '查询成功'
            })
        })
    })

    /* 接口说明
    * 功能：任务投诉
    * 返回值：code=1,投诉成功，其他失败
    * */
    app.post('/taskTouSu', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
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
            console.log('data:%o', postData)
            connection.query(
                "insert into task_tousu(ts_time,tsr,btsr,task_id) values(now(),?,?,?)",
                [postData.tsr, postData.btsr, postData.task_id],
                function (err, result) {
                    if (err) {
                        res.json({
                            code: 0,
                            msg: '参数错误'
                        })
                        return;
                    }
                    res.json({
                        code: 1,
                        msg: '投诉成功'
                    })
                })
        })
    })

    /* 接口说明 - 管理后台订单管理
    * 功能：查询所有的订单信息，以及订单用户的相关信息
    * 返回值：数组[]
    * */
    app.get('/queryOrderList', function (req, res) {
        connection.query("select o.*, u.account_number from order_list o left join user_manage u on o.userid=u.id", function (err, result) {
            if (err) {
                console.log(err.message)
                res.json({
                    code: 0,
                    msg: '查询错误'
                })
                return;
            }
            console.log(result)
            res.json({
                code: 1,
                data: result,
                msg: '查询成功'
            })
        })
    })

    /* 接口说明 - 管理后台任务投诉和任务完成审核时需要查看任务详情
    * 功能：查询任务详情，同时返回发布人的头像
    * 返回值：json对象{}
    * */
    app.get('/queryTaskDetail', function (req, res) {
        var query = req.query;
        var id = query.id
        console.log('id', id)
        connection.query("select t.*,u.head_img from task_list t left join user_manage u on t.announcer=u.account_number where t.id=?", [id], function (err, result) {
            if (err) {
                console.log(err.message)
                res.json({
                    code: 0,
                    msg: '查询错误'
                })
                return;
            }
            console.log(result)
            res.json({
                code: 1,
                data: result[0],
                msg: '查询成功'
            })
        })
    })

    /* 接口说明 - 我的任务，任务发布管理
    * 功能：根据用户token查询用户发布的所有任务或者用户接取的所有任务
    * 参数：token - 用户的token
    *       flag - publish用户发布的任务，receive用户接取的任务
    * 返回值：数组[]
    * */
    app.post('/queryMyTask', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        //创建空字符叠加数据片段
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
            myTaskAutomatic(postData.token, function (callbackData) {
                // console.log('callbackData', callbackData)
                switch (postData.flag) {
                    case 'publish':
                        connection.query(
                            `
                        SELECT
                            T.*,
                            ( SELECT head_img FROM user_manage WHERE account_number = T.announcer ) AS head_img,
                            ( SELECT count(*) FROM task_audit WHERE task_id = T.id and task_status = "已完成") AS task_success,
                            ( T.task_number - (SELECT count(*) FROM task_audit WHERE task_id = T.id and task_status != "任务失败")) AS task_remain,
                            ( SELECT count(*) FROM task_audit WHERE task_id = T.id and audit_status = "审核中") AS unaudit,
                            T2.release_time AS refund_release_time,
                            T2.approval_status AS refund_approval_status,
                            T2.reason AS reason
                        FROM
                            task_list T LEFT JOIN refund_audit T2 on T.id = T2.task_id
                        WHERE
                            announcer = ( SELECT account_number FROM user_manage WHERE token = ? )
                        ORDER BY id desc
                        `,
                            [postData.token], function (err, result) {
                                if (err) {
                                    console.log(err.message)
                                    res.json({
                                        code: 0,
                                        msg: '查询错误'
                                    })
                                    return;
                                }
                                res.json({
                                    code: 1,
                                    data: result,
                                    msg: '查询成功'
                                })
                            })
                        break;
                    case 'receive':
                        connection.query(
                            "select T.*,(SELECT task_name FROM task_list WHERE id = T.task_id) as task_name,(SELECT head_img FROM user_manage WHERE account_number = T.issuer_id) as head_img from task_audit T where user_id=(select id from user_manage where token=?)",
                            [postData.token], function (err, result) {
                                if (err) {
                                    console.log(err.message)
                                    res.json({
                                        code: 0,
                                        msg: '查询错误'
                                    })
                                    return;
                                }
                                // console.log(result)
                                res.json({
                                    code: 1,
                                    data: result,
                                    msg: '查询成功'
                                })
                            })
                        break;
                    default:
                        res.json({
                            code: 0,
                            msg: "参数错误"
                        })
                        return false;
                }

            })
        });
    })

    /** 接口说明
     * 功能：积分墙管理后台登录
     * 参数：用户账号和密码
     * 返回值：code=0成功，code=1失败
     * */
    app.post('/login', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        //创建空字符叠加数据片段
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
            console.log('296data:%o', postData)
            connection.query(
                'select * from user_manage WHERE account_number = ?',
                [postData.username],
                function (err, result) {
                    if (result.length > 0) {
                        let customerInfo = result[0];
                        console.log(postData.pass_word)
                        console.log(customerInfo)
                        if (postData.pass_word == customerInfo.pass_word) {
                            let token = crypto.createHash('md5').update(postData.username + new Date().getTime()).digest('hex');
                            // console.log('token:',token)
                            if (customerInfo.login_permission == '允许') {
                                connection.query(
                                    'UPDATE user_manage set token = ? WHERE account_number = ?',
                                    [token, postData.username],
                                    function (err, result) {
                                        if (result) {
                                            res.send({
                                                code: 0,
                                                msg: '登陆成功',
                                                token: token,
                                                customerInfo: {
                                                    account_number: customerInfo.account_number,
                                                    head_img: customerInfo.head_img,
                                                    actual_name: customerInfo.actual_name
                                                }
                                            })
                                        }
                                    }
                                )
                            } else {
                                res.send({
                                    code: 1,
                                    msg: '该账号当前无法登陆',
                                })
                            }

                        } else {
                            res.send({
                                code: 1,
                                msg: '密码错误'
                            })
                        }
                    } else {
                        res.send({
                            code: 1,
                            msg: '该账号不存在'
                        })
                    }
                }
            )
        });
    });

    /**接口说明 - 线报福利举报操作表accuse
     *参数
     * 返回值
     */
    app.post('/accuse_wall', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
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
            console.log('296data:%o', postData)

            connection.query(
                'insert into accuse (accusing_id,s_date,accused_id) VALUES (?,now(),?)',
                [postData.accusing_id, postData.accused_id],
                function (err, result) {
                    console.log(result)
                    console.log(err)
                    if (err) {
                        res.send({
                            code: 0,
                            msg: '举报失败'
                        })
                    }
                    res.send({
                        code: 1,
                        msg: '举报成功'
                    })
                }
            )
        })
    })

    //举报维权
    app.post('/accuse_wall', (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
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
            console.log('data:%o', postData)
            if (!postData.id) {
                res.json({
                    code: 0,
                    msg: "id不能为空",
                })
                return false;
            }


            connection.query({
                sql: 'select accuse.accusing_id,accuse.s_date,user_manage.account_number,user_manage.head_img from user_manage inner join accuse on accuse.accusing_id=user_manage.id and accused_id=' + postData.id,
                nestTables: '_'
            }, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "数据错误"
                    })
                    return;
                }
                // console.log(result);
                var accused_me = JSON.parse(JSON.stringify(result).replace(/accuse_accusing_id/g, "id"));
                accused_me = JSON.parse(JSON.stringify(accused_me).replace(/accuse_s_date/g, "s_date"));
                accused_me = JSON.parse(JSON.stringify(accused_me).replace(/user_manage_head_img/g, "head_img"));
                accused_me = JSON.parse(JSON.stringify(accused_me).replace(/user_manage_account_number/g, "account_number"));
                connection.query({
                    sql: 'select accuse.accused_id,accuse.s_date,user_manage.account_number,user_manage.head_img from user_manage inner join accuse on accuse.accused_id=user_manage.id and accusing_id=' + postData.id,
                    nestTables: '_'
                }, function (err, result2) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        res.json({
                            code: 0,
                            msg: "数据错误"
                        })
                        return;
                    }

                    // console.log(result2);
                    var me_accusing = JSON.parse(JSON.stringify(result2).replace(/accuse_accused_id/g, "id"));
                    me_accusing = JSON.parse(JSON.stringify(me_accusing).replace(/accuse_s_date/g, "s_date"));
                    me_accusing = JSON.parse(JSON.stringify(me_accusing).replace(/user_manage_head_img/g, "head_img"));
                    me_accusing = JSON.parse(JSON.stringify(me_accusing).replace(/user_manage_account_number/g, "account_number"));
                    res.json({
                        code: 1,
                        accused_me: accused_me,
                        me_accusing: me_accusing,
                        msg: "成功"
                    })


                });
            });
        })


    })

    //提现记录(偷个懒)
    app.get('/withdraw_wall', (req, res) => {
        if (!req.query.id) {
            res.json({
                code: 0,
                msg: "id不能为空",
            })
            return false;
        }

        var sql = "select * from withdraw WHERE user_id = " + req.query.id + " order by id desc";
        connection.query(sql, function (err, userData) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                res.json({
                    code: 0,
                    msg: "数据错误"
                })
                return;
            }
            if (userData.length === 0) {
                res.json({
                    code: 0,
                    msg: "用户不存在"
                })
                return false;
            }

            res.json({
                code: 1,
                data: userData,
                msg: "成功"
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

    // 任务审核聊天记录
    app.get('/getUserRecord', function (req, res, next) {
        let id = req.query.id;
        let token = req.query.token
        if (id) {
            getUserInfo(token, function (data) {
                if (data.length > 0 && data[0].is_admin == '1') {
                    console.log('data[0].is_admin', data[0].is_admin, id)
                    connection.query('SELECT T.issuer_id,(SELECT account_number FROM user_manage WHERE id = T.user_id) as user from task_audit T WHERE id = ' + id + '', function (err, result) {
                        console.log('result[0]', result[0])
                        let user = result[0].user;
                        let issuer = result[0].issuer_id;
                        console.log('SELECT * FROM chat_record WHERE (name = "' + user + '" and toUser = "' + issuer + '") or (name = "' + issuer + '" and toUser = "' + user + '")');
                        connection.query('SELECT * FROM chat_record WHERE (name = "' + user + '" and toUser = "' + issuer + '") or (name = "' + issuer + '" and toUser = "' + user + '")', function (err, result) {
                            console.log(user, issuer)
                            console.log(result)
                            res.send({
                                code: 1,
                                list: result
                            })
                        })

                    })
                } else {
                    res.send({
                        code: 2,
                        msg: '您的账号没有查看权限，请重新登陆'
                    })
                }
            })
        }
    })
    // 徒弟详情
    app.get('/students_wall', (req, res) => {
        var sql = 'SELECT T.*,(SELECT sum(money) FROM pay_in_out WHERE money_type = "师傅收入" and user_id = ' + req.query.id + ' and info REGEXP T.account_number) as all_money FROM user_manage T WHERE teacher_id = ' + req.query.id + '';
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
                            code: 0,
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

    //提现申请
    app.post('/cash/withdraw_wall', (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
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
            // console.log('data:%o', postData)
            if (!postData.id) {
                res.json({
                    code: 0,
                    msg: "id不能为空",
                })
                return false;
            }

            var sql = "select * from user_manage WHERE id = " + postData.id;
            if (Number(postData.service_charge) === NaN) {
                postData.service_charge = 0;
            } else {
                postData.service_charge = Number(postData.service_charge)
            }
            connection.query(sql, function (err, userData) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "数据错误"
                    })
                    return;
                }
                if (userData.length === 0) {
                    res.json({
                        code: 0,
                        msg: "用户不存在"
                    })
                    return false;
                } else {
                    var withdraw_money = Number(userData[0].withdraw_money);
                    if (postData.money_type == "现金余额") {
                        if (userData[0].cash_remain < parseInt(postData.money) - postData.service_charge) {
                            res.json({
                                code: 0,
                                msg: "现金余额不足无法提现"
                            })
                            return;
                        }
                        var modSql = 'UPDATE user_manage SET cash_remain = ?, withdraw_money = ? WHERE id = ?';
                        var money = userData[0].cash_remain - parseInt(postData.money) - postData.service_charge;
                        userData[0].cash_remain = Number(userData[0].cash_remain);
                    } else if (postData.money_type == "充值余额") {
                        if (userData[0].pay_remain < parseInt(postData.money) - postData.service_charge) {
                            res.json({
                                code: 0,
                                msg: "充值余额不足无法提现"
                            })
                            return;
                        }
                        var modSql = 'UPDATE user_manage SET pay_remain = ?, withdraw_money = ? WHERE id = ?';
                        var money = userData[0].pay_remain - parseInt(postData.money) - postData.service_charge;
                        userData[0].pay_remain = Number(userData[0].pay_remain);
                    }
                    if (money < 0) {
                        money = 0;
                    }
                    var addSql = 'INSERT INTO withdraw(user_id,s_date,info,user_name,with_status,service_charge,audit_status,money_type,money) VALUES(?,?,?,?,?,?,?,?,?)';
                    var addSqlParams = [postData.id, timestampToTime(new Date() / 1000, true), postData.info, userData[0].account_number, "未提现", postData.service_charge, "审核中", postData.money_type, postData.money];

                    connection.query(addSql, addSqlParams, function (err, backData) {
                        if (err) {
                            console.log('[INSERT ERROR] - ', err.message);
                            res.json({
                                code: 0,
                                msg: "数据添加失败"
                            })
                            return;
                        } else {

                            var modSqlParams = [money, withdraw_money + parseInt(postData.money), postData.id];
                            connection.query(modSql, modSqlParams, function (err, UPdata) {
                                if (err) {
                                    res.json({
                                        code: 0,
                                        msg: "数据修改失败"
                                    })
                                    return;
                                }
                                res.json({
                                    code: 1,
                                    data: {
                                        cash_remain: Number(postData.money_type == "现金余额" ? (userData[0].cash_remain - parseInt(postData.money) - postData.service_charge < 0 ? userData[0].cash_remain : userData[0].cash_remain - parseInt(postData.money) - postData.service_charge) : userData[0].cash_remain),
                                        pay_remain: Number(postData.money_type == "充值余额" ? (userData[0].pay_remain - parseInt(postData.money) - postData.service_charge < 0 ? userData[0].pay_remain : userData[0].pay_remain - parseInt(postData.money) - postData.service_charge) : userData[0].pay_remain),
                                    },
                                    msg: "成功"
                                })
                            })

                        }

                    })
                }
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
    //管理后台设置新人专享金额
    app.post('/new/newComerSet', (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
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
            // console.log('data:%o', postData)
            if (postData.set) {//设置
                if (!postData.token) {
                    res.json({
                        code: 0,
                        msg: "参数不能为空",
                    })
                    return false;
                }
                var str_sql = "UPDATE new_award SET money = CASE task_num ";
                for (var i in postData.task_num) {
                    str_sql += ' WHEN ' + postData.task_num[i] + ' THEN ' + postData.money[i]
                }
                str_sql += ' END WHERE task_num IN (' + postData.task_num.join() + ')'
                // console.log(str_sql)
                connection.query(str_sql, function (err, result) {
                    if (err) {
                        res.json({
                            code: 0,
                            msg: "保存失败"
                        })
                        return;
                    }
                    res.json({
                        code: 1,
                        msg: "保存成功"
                    })
                    // console.log('1096',result)
                })
            } else {//查询
                connection.query('SELECT task_num ,money FROM new_award ORDER BY task_num ASC', function (err, result) {
                    if (err) {
                        res.json({
                            code: 0,
                            msg: "查询失败"
                        })
                        return;
                    }
                    if (result.length > 0) {
                        var _money = [], _num = [];
                        for (var i = 0; i < result.length; i++) {
                            _num.push(result[i].task_num)
                            _money.push(result[i].money)
                        }
                        res.json({
                            code: 1,
                            result: {
                                task_num: _num,
                                money: _money
                            },
                            msg: "成功"
                        })
                    } else {
                        res.json({
                            code: 0,
                            msg: "无数据"
                        })
                        return;
                    }
                })
            }
        })
    })
    // 新人专享
    /**
     * 现在新人专享逻辑变了，当领奖励的时候，先判断他领过没有，然后将领的任务序号存入数组
     * */
    app.post('/new/usertask_wall', (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
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
            // console.log('data:%o', postData)
            if (!postData.id) {
                res.json({
                    code: 0,
                    msg: "id不能为空",
                })
                return false;
            }
            var sql = "select * from user_manage WHERE id = " + postData.id;
            connection.query(sql, function (err, userData) {
                if (err) {
                    // console.log('[SELECT ERROR] - ', err.message);
                    res.json({
                        code: 0,
                        msg: "数据错误"
                    })
                    return;
                }
                if (userData.length === 0) {
                    res.json({
                        code: 0,
                        msg: "用户不存在"
                    })
                    return false;
                } else {
                    var sql = "select * from task_audit WHERE user_id = " + postData.id + " and task_status = '已完成'";
                    connection.query(sql, function (err, taskData) {
                        if (err) {
                            // console.log('[SELECT ERROR] - ', err.message);
                            res.json({
                                code: 0,
                                msg: "数据错误"
                            })
                            return;
                        }
                        // 领取奖励
                        if (postData.getaward) {
                            if (!postData.num || !(postData.num >= 1 && postData.num <= 3)) {//领奖励的时候一定要判断，避免用户重复领奖
                                res.json({
                                    code: 0,
                                    msg: "参数错误",
                                })
                                return false;
                            }
                            //查询每个任务对应的奖励金额
                            connection.query('SELECT * FROM new_award ORDER BY task_num ASC', function (err, new_award) {
                                if (err) {
                                    res.json({
                                        code: 0,
                                        msg: "失败"
                                    })
                                    return;
                                }
                                // console.log(new_award)
                                // console.log('1131', userData[0].new_get_award)
                                var award_ary = userData[0].new_get_award ? JSON.parse(userData[0].new_get_award) : [];//将字符串转化为数组
                                if (award_ary.indexOf(postData.num) > -1) {//如果领取的记录中有记录，那么提示不能重复领取
                                    res.json({
                                        code: 0,
                                        msg: "不能重复领取"
                                    })
                                    return;
                                } else {
                                    award_ary.push(Number(postData.num))
                                    // console.log(award_ary)
                                    // console.log('1142',JSON.stringify(award_ary))
                                    // console.log(new_award[Number(postData.num) - 1].money)
                                    var modSql = 'UPDATE user_manage SET new_get_award = ?, cash_remain = ? WHERE id = ?';
                                    var modSqlParams = [JSON.stringify(award_ary), Number(userData[0].cash_remain) + Number(new_award[Number(postData.num) - 1].money), postData.id];
                                    connection.query(modSql, modSqlParams, function (err, UPdata) {
                                        // console.log(err)
                                        if (err) {
                                            // console.log(err)
                                            res.json({
                                                code: 0,
                                                msg: "失败"
                                            })
                                            return;
                                        }

                                        var addSql = 'INSERT INTO pay_in_out(user_id,s_date,money,money_type,info) VALUES(?,?,?,?,?)';
                                        var addSqlParams = [postData.id, timestampToTime(new Date() / 1000, true), new_award[Number(postData.num) - 1].money, "新人奖励收入", "新手任务奖励" + new_award[Number(postData.num) - 1].money + "元"];

                                        connection.query(addSql, addSqlParams, function (err, backData) {
                                            if (err) {
                                                console.log('[INSERT ERROR] - ', err.message);
                                                res.json({
                                                    code: 0,
                                                    msg: "失败"
                                                })
                                                return;
                                            }
                                            res.json({
                                                code: 1,
                                                data: new_award[Number(postData.num) - 1].money,
                                                msg: "成功"
                                            })
                                        })
                                    })
                                }

                            })
                        } else {//输出领取奖励数组和任务个数
                            res.json({
                                code: 1,
                                data: {
                                    get_award: userData[0].new_get_award,
                                    task_number: taskData.length
                                },
                                msg: "成功"
                            })
                        }

                    })
                }
            })
        })
    })
    // 自动处理审核超时 执行超时任务
    function Automatic() {
        // 查询审核超时任务改为自动完成
        connection.query(
            'SELECT T.*,(SELECT token FROM user_manage WHERE id = T.user_id) as token FROM task_audit T WHERE task_status = "待审核" and audit_status = "审核中" and now() > audit_time',
            function (err, result) {
                if (result.length > 0) {
                    let sqlStr = 'UPDATE task_audit SET task_status = CASE id ';
                    let where = [];
                    for (let i in result) {
                        sqlStr += 'WHEN ' + result[i].id + ' THEN "已完成" '
                        where.push(result[i].id)
                        let obj = {
                            token: result[i].token,
                            type: '任务收入',
                            money: result[i].task_money,
                            poundage: 0,
                            task_id: result[i].task_id,
                            udid: (result[i].udid == 'null' || !(result[i].udid)) ? '1' : result[i].udid
                        }
                        shouZhi(obj)
                    }
                    sqlStr += 'END,audit_status = CASE id '
                    for (let i in result) {
                        sqlStr += 'WHEN ' + result[i].id + ' THEN "已通过" '
                    }
                    sqlStr += 'END,audit_type = CASE id '
                    for (let i in result) {
                        sqlStr += 'WHEN ' + result[i].id + ' THEN "超时自动审核" '
                    }
                    sqlStr += 'END WHERE id in (' + where.join(',') + ')'
                    connection.query(sqlStr, [], function (err, result) {
                        console.log('审核超时自动完成', sqlStr, result, err)
                    })
                }
            }
        )
        // 被驳回之后超过N小时没有重新提交判断为任务失败
        connection.query(
            'SELECT T.*,(SELECT token FROM user_manage WHERE id = T.user_id) as token FROM task_audit T WHERE task_status = "待审核" and audit_status = "已驳回" and now() > DATE_ADD(s_date,interval 1 hour)',
            function (err, result) {
                if (result.length > 0) {
                    let sqlStr = 'UPDATE task_audit SET task_status = CASE id ';
                    let where = [];
                    for (let i in result) {
                        sqlStr += 'WHEN ' + result[i].id + ' THEN "任务失败" '
                        where.push(result[i].id)
                    }
                    sqlStr += 'END WHERE id in (' + where.join(',') + ')'
                    connection.query(sqlStr, [], function (err, result) {
                        console.log('驳回超时没有重新提交任务失败', sqlStr, result, err)
                    })
                }
            }
        )
        // 完成任务超时设为任务失败
        connection.query(
            'SELECT * FROM task_audit  WHERE task_status = "进行中" and now() > limit_time',
            function (err, result) {
                if (result.length > 0) {
                    let sqlStr = 'UPDATE task_audit SET task_status = CASE id ';
                    let where = [];
                    for (let i in result) {
                        sqlStr += 'WHEN ' + result[i].id + ' THEN "任务失败" '
                        where.push(result[i].id)
                    }
                    sqlStr += 'END WHERE id in (' + where.join(',') + ')'
                    console.log(sqlStr)
                    connection.query(sqlStr, [], function (err, result) {
                        console.log('完成超时任务失败', sqlStr, result, err)
                    })
                }
            }
        )
        // 任务结束1天之后查询是否有剩余任务 有->已取消  无->已完成
        connection.query(
            `
            SELECT
                * 
            FROM
                (
            SELECT
                t1.*,
                count( t2.id ) count 
            FROM
                ( SELECT * FROM task_list WHERE task_status = "进行中" and approval_status = "审核通过" and now() > DATE_ADD(end_time,INTERVAL 1 day) ) t1
                LEFT JOIN 
                ( SELECT * FROM task_audit WHERE audit_status = "已通过" ) t2 ON t1.id = t2.task_id 
            GROUP BY
                t1.id 
                ) AS cc
            `,
            function (err, result) {
                if (result.length > 0) {
                    let sqlStr = 'UPDATE task_list SET task_status = CASE id ';
                    let where = [];
                    for (let i in result) {
                        if (result[i].count < result[i].task_number) {
                            sqlStr += 'WHEN ' + result[i].id + ' THEN "已取消" '
                            where.push(result[i].id)
                        } else {
                            sqlStr += 'WHEN ' + result[i].id + ' THEN "已完成" '
                            where.push(result[i].id)
                        }
                    }
                    sqlStr += 'END WHERE id in (' + where.join(',') + ')'
                    console.log(sqlStr)
                    connection.query(sqlStr, [], function (err, result) {
                        console.log('任务到期归档', sqlStr, result, err)
                    })
                }
            }
        )
    }
    // 处理自己的超时任务
    function myTaskAutomatic(token, _callback) {
        _callback('end')
    }

    function shouZhi(obj) {
        let args = '?';
        for (let key in obj) {
            args += key + '=' + obj[key] + '&'
        }
        args = encodeURI(args.substring(0, args.length - 1))
        console.log('http://39.108.10.188:8999/api/user/payout' + args)
        request('http://39.108.10.188:8999/api/user/payout' + args, function (error, response, body) {
            console.log(error)
            console.log(response.statusCode)
            if (response.statusCode == 200) {
                // console.log(body) // 请求成功的处理逻辑
            } else {
            }
        });
    }

    // 自己的任务自动处理
    function taskAutomatic(taskId, _callback) {
        connection.query(
            'SELECT count(*) as count FROM task_audit WHERE task_id = ? and task_status != "任务失败"',
            [taskId],
            function (err, result) {
                if (result) {
                    _callback(result[0].count)
                }
            }
        )
    }

    // 获取用户信息
    function getUserInfo(token, callback) {
        connection.query(
            'select * from user_manage where token = ?',
            [token],
            function (err, result) {
                if (result) {
                    callback(result)
                }
            }
        )
    }

    // 获取任务信息
    function getTaskInfo(taskId, callback) {
        connection.query(
            'select * from task_list where id = ?',
            [taskId],
            function (err, result) {
                if (result) {
                    callback(result)
                }
            }
        )
    }

    // 获取任务审核信息
    function getTaskAuditInfo(taskId, token, callback) {
        connection.query(
            'select *,(select task_time from task_list where id = ?) as task_time from task_audit where task_id = ? and user_id = (SELECT id FROM user_manage WHERE token = ?)',
            [taskId, taskId, token],
            function (err, result) {
                if (result) {
                    callback(result)
                }
            }
        )
    }
}
let localIp;

// 获取本机IP
function getIPAdress() {
    if (localIp) return localIp;
    let localIPAddress = "";
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                localIPAddress = alias.address;
            }
        }
    }
    localIp = localIPAddress;
    return localIPAddress;
}

// 获取用户ip
function getClientIp(req) {
    try {
        return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
            req.connection.remoteAddress || // 判断 connection 的远程 IP
            req.socket.remoteAddress || // 判断后端的 socket 的 IP
            req.connection.socket.remoteAddress;
    } catch (e) {
        console.log("getClientIp error");
        return "";
    }
}

// 格式化mysql插入语句
function getInsertData(insert) {
    let keys = [];
    let values = [];
    let defalut = [];
    for (let i in insert) {
        keys.push(i)
        values.push(insert[i])
        defalut.push('?')
    }
    keys = keys.join(',')
    defalut = defalut.join(',')
    let result = { keys, values, defalut }
    return result
}

//深度克隆
function deepClone(obj) {
    var result, oClass = isClass(obj);
    //确定result的类型
    if (oClass === "Object") {
        result = {};
    } else if (oClass === "Array") {
        result = [];
    } else {
        return obj;
    }
    for (key in obj) {
        var copy = obj[key];
        if (isClass(copy) == "Object") {
            result[key] = arguments.callee(copy);//递归调用
        } else if (isClass(copy) == "Array") {
            result[key] = arguments.callee(copy);
        } else {
            result[key] = obj[key];
        }
    }
    return result;
}

//返回传递给他的任意对象的类
function isClass(o) {
    if (o === null) return "Null";
    if (o === undefined) return "Undefined";
    return Object.prototype.toString.call(o).slice(8, -1);
}

function getDateString(date, type) {
    if (date == '' || !date) {
        date = new Date();
    } else {
        date = new Date(date)
    }
    // console.log('end',date)
    var year = date.getFullYear();
    var month = formatNumber(date.getMonth() + 1);
    var day = formatNumber(date.getDate());
    var hours = formatNumber(date.getHours());
    var minutes = formatNumber(date.getMinutes());
    var seconds = formatNumber(date.getSeconds());
    if (type == 'number') {
        return year + month + day + hours + minutes + seconds
    } else if (type == 'endTime') {
        return year + '-' + month + '-' + day + ' 23:59:59'
    } else {
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
    }
}

// 获取随机数
function getRandomNumber(length) {
    var str = '';
    for (var i = 0; i < length; i++) {
        str += parseInt(Math.random() * 10)
    }
    return str
}

// 数字格式化
function formatNumber(num) {
    num < 10 ? num = '0' + num : '';
    return num
}

//日期时间格式化
function formateDate(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();

    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();

    return y + '-' + padding(m) + '-' + padding(d) + ' ' + padding(hh) + ':' + padding(mm) + ':' + padding(ss)
}

function padding(n) {
    return n >= 10 ? n : '0' + n
}

// 执行多重异步
function doAsyn(arr) {
    let o = 0;
    child()

    function child(data) {
        let step = arr[o];
        // console.log('o',o)
        // console.log('data',data)
        if (o < arr.length) {
            step(function (data) {
                o++
                child(data)
            }, data)
        } else {
            console.log('没有下一步啦')
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