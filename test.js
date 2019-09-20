// 2019-8-1
// 用户管理
app.get('/UserManagerwall', (req, res) => {
    var sql=`SELECT 
    T.*,
    (SELECT count(teacher_id) FROM user_manage WHERE teacher_id = T.id) as student_number,
    (SELECT account_number FROM user_manage WHERE id = T.teacher_id) as teacher_name,
    (SELECT sum(money) FROM pay_in_out WHERE user_id = T.id and (money_type="收入" or money_type="任务收入" or money_type="师傅收入")) as accumulated
  FROM 
    user_manage T
    ORDER BY T.id DESC`;

    connection.query(sql,function (err, Data) {
        if(err){
            res.json({
                code: 0,
                msg:"数据错误"
            }) 
            console.log(err)
            return;
        }
        Data=JSON.parse(JSON.stringify(Data).replace(/account_number/g,"account"));
        
        Data=JSON.parse(JSON.stringify(Data).replace(/teacher_name'/g,"accumulated'"));

        res.json({
            code: 1,
            list:Data,
            msg:"成功"
        }) 

    })

})

// 徒弟详情
app.get('/students_wall', (req, res) => {
    var sql="SELECT a.*,b.all_money FROM `user_manage` as a ";
        sql+=`
        LEFT JOIN (SELECT sum(back_teacher_money) as all_money,user_id FROM task_audit group by user_id) as b
        on a.id=b.user_id
        where teacher_id = `+req.query.id+`
        ORDER BY a.id DESC`;
    connection.query(sql,function (err, Data) {
        if(err){
            res.json({
                code: 0,
                msg:"数据错误"
            }) 
            console.log(err)
            return;
        }
        res.json({
            code: 1,
            list:Data,
            msg:"成功"
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
            if(postData.indexOf('}') > -1){
                postData = JSON.parse(postData)
            }else{
                postData = querystring.parse(postData)
            }
            // 删除
            if(postData.doing=="Delete"){
                var sql="delete from user_manage where id = "+postData.id;
                connection.query(sql,function (err, Data) {
                    if(err){
                        res.json({
                            code: 0,
                            msg:"数据错误"
                        }) 
                        console.log(err)
                        return;
                    }
                    res.json({
                        code: 1,
                        msg:"删除成功"
                    }) 
                })
            }else if(postData.doing=="Edit"){
                var modSql = 'UPDATE user_manage SET user_nickName = ?, pass_word = ?, alipay = ?, wechat = ? WHERE id = ?';
                var modSqlParams = [postData.user_nickName,postData.password,postData.alipay,postData.wechat,postData.id];       
                    connection.query(modSql,modSqlParams,function (err, backData) {
                        if(err){
                            console.log(err)
                            res.json({
                                status: 0,
                                msg:"修改失败"
                            })
                            return;
                        }
                        res.json({
                            code: 1,
                            msg:"编辑成功"
                        }) 

                    })
            }
        })
})