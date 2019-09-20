module.exports = function (app, connection) {
    // 后台用户查询
    app.get('/system/user', function (req, res, next) {
        var sql = "select * from wrj_user";
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
}