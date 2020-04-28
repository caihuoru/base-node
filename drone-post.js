module.exports = function (app, connection, fs, path, jwt) {
    // 点赞或取消点赞
    app.post('/wrj_post/like', (req, res) => {

        var sql = `select * from wrj_likePost where userId =${parseInt(req.body.userId)} and postId = ${req.body.postId}`
        connection.query(sql, function (err, Data) {
            if (err) {
                res.json({
                    code: 0,
                    msg: "失败"
                })
                // console.log(err)
                return false;
            }
            if (Data.length > 0) {
                var sql = `DELETE FROM wrj_likePost where userId =${parseInt(req.body.userId)} and postId = ${req.body.postId}`;
                //查
                connection.query(sql, function (err, userData) {
                    if (err) {
                        res.json({
                            code: 2,
                            msg: "取消点赞失败"
                        })
                        return;
                    }
                    res.json({
                        code: 3,
                        msg: "取消点赞成功"
                    })
                })
                return false;
            } else {
                var addSql = 'INSERT INTO wrj_likePost(userId,postId) VALUES(?,?)';
                var addSqlParams = [req.body.userId, req.body.postId];
                connection.query(addSql, addSqlParams, function (err, result2) {
                    if (err) {
                        console.log(err)
                        res.json({
                            code: 0,
                            msg: "点赞失败"
                        })
                        return;
                    }
                    res.json({
                        code: 1,
                        msg: "点赞成功"
                    })

                })
            }
        })


    })

    // 帖子添加评论
    app.post('/post/comment/add', (req, res) => {
        // wrj_postComment
        var addSql = 'INSERT INTO wrj_postComment(userId,postId,content,time) VALUES(?,?,?,?)';
        var addSqlParams = [req.body.userId, req.body.postId, req.body.content, timestampToTime(new Date() / 1000, true)];
        connection.query(addSql, addSqlParams, function (err, result2) {
            if (err) {
                console.log(err)
                res.json({
                    code: 0,
                    msg: "评论失败"
                })
                return;
            }
            var sql = `select * from wrj_postComment where postId = ${req.body.postId}`
            connection.query(sql, function (err, userData) {
                if (err) {
                    console.log(err)
                    res.json({
                        code: 0,
                        msg: "评论失败"
                    })
                    return;
                }
                res.json({
                    code: 1,
                    data: userData,
                    msg: "评论成功"
                })
            })


        })
    })
    // 帖子评论查询
    app.get('/post/comment/select', (req, res) => {
        var sql = `select * from wrj_postComment where postId = ${req.query.postId}`
        connection.query(sql, function (err, userData) {
            if (err) {
                console.log(err)
                res.json({
                    code: 0,
                    msg: "失败"
                })
                return;
            }
            res.json({
                code: 1,
                data: userData,
                msg: "成功"
            })
        })
    })

    // 发布帖子
    app.post('/add/post', function (req, res, next) {

        var addSql = 'INSERT INTO wrj_post(userId,type,title,content,image,address,time,isTop) VALUES(?,?,?,?,?,?,?,?)';
        var addSqlParams = [req.body.userId, req.body.type, req.body.title, req.body.content, req.body.image, req.body.address, timestampToTime(new Date() / 1000, true), req.body.isTop];
        console.log(addSqlParams)
        connection.query(addSql, addSqlParams, function (err, result2) {
            if (err) {
                // console.log(err)
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
    })

    // 我的帖子
    app.get('/my/post', function (req, res, next) {
        req.query.size = req.query.size || 10;
        req.query.index = req.query.index || 1;
        // SELECT COUNT(*) as dznum ,postid FROM wrj_likePost GROUP BY postid
        let COUNT = `SELECT COUNT(*) as total FROM wrj_post WHERE  userId =${req.query.userId}`;


        var sql = `select T.* ,
        (SELECT icon FROM wrj_user WHERE id = T.userId) as icon ,
        (SELECT COUNT(*) FROM wrj_likePost WHERE postId = T.id) as like_
        from wrj_post T 
        where userId = ${req.query.userId} limit ${(req.query.index - 1) * req.query.size},${req.query.size}
      `

        connection.query(sql, function (err, userData) {
            if (err) {
                console.log(err)
                res.json({
                    code: 0,
                    msg: "未知错误"
                })
                return;
            }
            connection.query(COUNT, function (err, num) {
                if (err) {
                    console.log(err)
                    res.json({
                        code: 0,
                        msg: "未知错误"
                    })
                    return;
                }
                console.log(num)
                let total = Math.ceil(num[0].total / req.query.size);

                res.json({
                    code: 1,
                    data: userData,
                    total: total,
                    msg: "成功"
                })
            })


        });
    })
    // 帖子详情接口
    app.get('/post/details', function (req, res, next) {
        var sql = `select T.* ,
        (SELECT icon FROM wrj_user WHERE id = T.userId) as icon
        from wrj_post T 
        where id = ${req.query.postId}`
        connection.query(sql, function (err, Data) {
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
                data: Data,
                msg: "成功"
            })
        })
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




