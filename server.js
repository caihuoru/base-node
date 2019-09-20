var express = require('express');
var router = express.Router();
var path = require('path');
var app = express();
var bodyParser = require('body-parser');//解析,用req.body获取post参数
var port = 8080;
var ipaddress = getIPAdress();//ip地址
var mysql  = require('mysql');  
var Pay = require('cn-pay')
require('body-parser-xml')(bodyParser);
var schedule = require("node-schedule");

const config={     
    host     : '39.108.10.188',       
    user     : 'root',              
    password : '123456',       
    port: '3306',    
    database: "sleep"             
}
// 支付宝
const payConfig = {
    app_id: '2019051064471085', // appid
    private_key:"MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD4+QaEXeXB6TiLO6jfMXH6YCYoob8H+ojO3KHIMLZMRCrv60mIVZzQLmR3ewi36Va6IAQ25LEZab57s8ZMOArzaco1RbZKrfJvIi2vPI9Aa/Q7TLM8iXofR9HNgoCRwesMczoKheyLtaTnjJBPlgN+HGMBqJS2KSRcBTK23Im0H76ofMZ/RBIRYE3dyV54Gk24Pac/O0H0AgjbRYmnHGkW2BnXchemLC6FbNVMfhSKeEZ0ksmhjwOQBClZ11ZVRw7UwlX8Gyjvt4HpRWM+expuXbNEs6D1lrGIRm/2QD+P3NKRYqo/j0Efl+cfh0BL39AF3M9zTFgW0JeSk5Dev0BNAgMBAAECggEBAMPzWsm7DSV85N/QaKyhQc+I9P9tregdqqcExt/EVvXXgOOrDwiaOP0wRiozTz1QDM4YfLinbStPKng5mYxLX3MMg/VBlKNaHECTadlNlIFjdalmSHsQyGjuIZXZbE9LjC8UUU4O8YlTwSHsY3f/3WfX96RKhiCIaPFzteJt2INGG2TQYJPtW99TRB36ZBUSPwfLMVbBA2ih4cOKRDsG42kkMDNZb5A+lplHTslioPUbkafPj+uFtcCcmmfloO7DIiHzqyRPTsvDy/0v714JTqGA+AGrnizrDbYU5awQrowYyv2IIPiqthS6WnIF0ed4Ay0XEodoJsumiMf7Xl5pnIECgYEA/dBCps9uKbr4S4P0Krx/rabXCysA6wpNWgXE82nkGWCEAxSNMWGU4MfOhBhOHwrgblFiiO+DJpPlN1ABniUp7WzZIgDfYi3WHpHW4hr+pfJQwaqHdkOChhjM3pktwE2+webONAXrGSDzhQhYz4GFM/iPbIGYcJ1kAPFij8zX8NkCgYEA+x4W9TNeokEWvDSOk3H1fYi5XqpDOQbIlVD3P1Fa3N1NHS0O2oG/EwRnTh+Nq/cpv2JfmkZ06spwFpCYMSXy61d73nnhnC2RdmUriedZXz+FlLLU1fElAvNDgqDMPtUhL756Boe5KqNMQuZxGy3s5AMqkRvvlxeGLSPXTFelYpUCgYBNJ4u7TX79bHqh6gDFJPvi+76PBImI6V7OKMbP/7Z5CF/Y19x70GADXHmoqgLFaPcEUfUUD0rc5UReZhG30zBFnjr7HSzKmYhnTon1vaL/KwPle0Mmbis1PEC6wfGobXm5U8IHCm2G+/9Kx1jH62VkgQCISXTfdti5eKcvc2OJMQKBgQCrPfqj3RL0jHRHhYOQko64u0rFfk/3DGQuRpdEa2MN6C+U7MwLP50gB8m2oZfHo/WpGBlfqBpEniXPjWzrXxiHWhITRYQPL5fZZ+ZH1SbB6BxcqZKwDhCSMXdhFewSEN7fowGtgFJJ/C+eE20f/rJjTrFxYN6CZz1NfPptifsy/QKBgGrE0q3FPxvXSMNQ8jANzgii2RQQaMfPhomxhj7zpd4H0OiZhlDNuTrzvbVCguM6veb9n+ehqU+EzukjKyxmmSpOtAsX0CS46apRoisF3lni5Ar5o/FixX+PkLO+RuTvyZtZPPaqNFQVotFV6BS2VLTswZdmnw9sYtVhgR5yzYor", // 商户私钥 注意：此处不是文件路径，一定要是文件内容
    public_key:"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoURPGE5fyvF43fKKHP2ip4t0r0Fag/1i9ba2Nir6FBPyMJFJ3W6OWTZEjGfXkgZaxxw1sYEKUoxsouBlj+K12XXt0mb6ZUb9Udfok6u9+WcQEjiOeB842Yp50xHeqGgdgmGdOg4teZZ4Fk1p2uJn4dRa1x7pD03cT7ozPatounj6KEMDJqOX8z5nBtn7xPkS0RYzF3u8GDOXShdRhkO6tG4AHqKC1sb3OZwToAzUz3ba/cu2a/UyO5wAPDgEE1D6JMMfNQTAFviVINkjFqf9U8EYH4LIQi825iMpDen/N70Vk7gtv0vqlOmb+S+XdA5ZTnQ06TGZyhJxN5fHxj7l/wIDAQAB", // 支付宝公钥 注意：此处不是文件路径，一定要是文件内容
    notify_url: 'http://39.108.10.188:8080/payBack', // 通知地址
    return_url: 'http://39.108.10.188:8080/return', // 跳转地址
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
var alipay = Pay.alipay(payConfig);
var connection = mysql.createPool({     
    host     : config.host,       
    user     : config.user,              
    password : config.password,       
    port: config.port,                   
    database: config.database  
}); 
   

// post请求需要
app.use(bodyParser.urlencoded({ extended: false }));
// xml需要
app.use(bodyParser.xml({
    limit: '2MB',   // Reject payload bigger than 1 MB
    xmlParseOptions: {
      normalize: true,     // Trim whitespace inside text nodes
      normalizeTags: true, // Transform tags to lowercase
      explicitArray: false // Only put nodes in array if >1
    }
  }));

var outTradeId = Date.now().toString();


app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
  });

// var ali = new Alipay({
//     appId: '2019051064471085',
//     notifyUrl: 'http://39.108.10.188:8080/payBack',
//     rsaPrivate: path.resolve('./pem/rsa_private_key.pem'),
//     rsaPublic: path.resolve('./pem/rsa_public_key.pem'),
//     // sandbox: true,
//     signType: 'RSA2'
// });
var day=86400;
// 打酱油
router.get('/', function(req, res, next) {

    // res.render('index');
    res.json("isok")

});
// 登陆
app.post('/login', function(req, res, next) {
    if(!req.body.id){
        res.json({
            code: 0,
            msg:"id不能为空"
        }) 
        return false;
    }
    var  sql = "select * from user where userid = '"+req.body.id+"'";
    //查
    connection.query(sql,function (err, result) {
            if(err){
            console.log('[SELECT ERROR] - ',err.message);
                res.json({
                    code: 0,
                    msg:"参数错误"
                }) 
                return;
            }
            // console.log(result)
            if(result.length===0){
                var token_=token(8);
                var  addSql = 'INSERT INTO user(userid,isvip,status,expiretime,token,username) VALUES(?,?,?,?,?,?)';
                var  addSqlParams = [req.body.id,0,0,null,token_,req.body.id];
                //增
                connection.query(addSql,addSqlParams,function (err, result2) {
                        if(err){
                        console.log('[INSERT ERROR] - ',err.message);
                            res.json({
                                code: 0,
                                msg:"注册失败"
                            }) 
                            return;
                        }        
                        console.log('--------------------------INSERT----------------------------');
                        res.json({
                            code: 1,
                            data:{
                                userName:req.body.id,
                                isVip:0,
                                expiretime:null,
                                remainder:null,
                                status:0,
                                token:token_,
                                type:'registered',
                                
                            },
                            msg:"成功"
                        }) 
                    
                 });
                
            }else{
                res.json({
                    code: 1,
                    data:{
                        userName:result[0].userid,
                        isVip:parseInt(result[0].isvip),
                        expiretime:result[0].expiretime,
                        remainder:function(){
                            var timestamp = Date.parse(result[0].expiretime)/ 1000;
                            var todayTime = Date.parse(new Date())/ 1000 
                            todayTime = timestampToTime(todayTime);
                            todayTime = Date.parse(todayTime)/ 1000 
                            timestamp=(timestamp-todayTime)/day
                            console.log(timestamp);
                            return timestamp;
                        }(),
                        status:parseInt(result[0].status),
                        token:result[0].token,
                        type:'login'
                    },
                    msg:"成功"
                })
            }
    });  
    
});
// 数据查询
app.post('/data', function(req, res, next) {
    if(!req.body.id){
        res.json({
            code: 0,
            msg:"id不能为空"
        }) 
        return false;
    }
    var  sql = "select * from user where userid = '"+req.body.id+"'";
    //查
    connection.query(sql,function (err, result) {
            if(err){
            console.log('[SELECT ERROR] - ',err.message);
                res.json({
                    code: 0,
                    msg:"参数错误"
                }) 
                return;
            }
            console.log(result)
            if(result.length===0){
                        res.json({
                            code: 0,
                            msg:"用户不存在"
                        })
                
            }else{
                res.json({
                    code: 1,
                    data:{
                        userName:result[0].username,
                        isVip:parseInt(result[0].isvip),
                        expiretime:result[0].expiretime,
                        remainder:function(){
                            var timestamp = Date.parse(result[0].expiretime)/ 1000;
                            var todayTime = Date.parse(new Date())/ 1000 
                            todayTime = timestampToTime(todayTime);
                            todayTime = Date.parse(todayTime)/ 1000 
                            timestamp=(timestamp-todayTime)/day
                            console.log(timestamp);
                            return timestamp;
                        }(),
                        status:parseInt(result[0].status),
                        token:result[0].token,
                        // type:'login'
                    },
                    msg:"成功"
                })
            }
    });  
    
});


// 支付
app.post('/pay', function(req, res, next) {
    console.log(req.body)
        var payObj={
            userid:req.body.id || "test",
            money:req.body.money || 0.01,
            statuts:req.body.statuts || 0,
            viptype:req.body.viptype || 2, //默认是2
            order_time:function(){
                var timestamp = Date.parse(new Date());
                timestamp = timestamp / 1000;
                return timestampToTime(timestamp)
            }(),
            order_number:function(){
                var timestamp = Date.parse(new Date());
                timestamp = timestamp / 1000;
                return "SDSM"+token(2)+timestamp;
            }(),
        }
        //生成订单
        var  addSql = 'INSERT INTO orderlist(userid,money,statuts,order_time,viptype,order_number,auto_fee) VALUES(?,?,?,?,?,?,?)';
        var  addSqlParams = [payObj.userid,payObj.money,payObj.statuts,payObj.order_time,payObj.viptype,payObj.order_number,0];
       
        connection.query(addSql,addSqlParams,function (err, backData) {
                if(err){
                    console.log('[INSERT ERROR] - ',err.message);
                    res.json({
                        code: 0,
                        err:err.message,
                        msg:"生成订单失败"
                    })
                return;
                }        
        
            
               
                var order = {
                    out_trade_no: payObj.order_number,
                    total_amount: req.body.money, // 单位 元
                    subject: '闪电睡眠支付宝支付'
                    
                }
                const wechatOrder = {
                    out_trade_no: payObj.order_number,
                    body: '闪电睡眠微信支付',
                    total_fee: req.body.money, // 直接以元为单位
                    // spbill_create_ip: 'spbill_create_ip' // 客户端ip
                  }
                  
                  const webPayResult = wechat.app(wechatOrder) 
                //   console.log(order)


                const result =  alipay.app(order) // 此方法返回Promise
                // console.log(result)
                result.then(function (rs) {
                    webPayResult.then(function(wc){
                        res.json({
                            code: 1,
                            data:function(){
                                if(Number(req.body.paytype)===1){
                                    return {
                                        // wechat:wc,
                                        wechat:function(){
                                           
                                            return wc;
                                        }(),
                                        order:payObj.order_number 
                                    };
                                }else{
                                    return{
                                        // wechat:wc,
                                        result:function(){
                                           
                                            return rs;
                                        }(),
                                        order:payObj.order_number 
                                    }
                                }
                            }(),
                            msg:"成功"
                        })
                    })
    
                });
        })
           
            
            
  
});

app.get('/return', (req, res) => {
    console.log(req.query)
    console.log("支付返回")    
    res.json("支付返回")
})

// 订单查询
app.post('/order', (req, res) => {

    var  sql = "select * from orderlist where order_number = '"+req.body.order_number+"'";
    connection.query(sql,function (err, orderData) {
        if(err){
        console.log('[SELECT ERROR] - ',err.message);
            res.json({
                code: 0,
                msg:"数据错误"
            }) 
            return;
        }
        if(orderData.length===0){
            res.json({
                code: 0,
                msg:"订单不存在"
            })
        
        }else{
            orderData[0].statuts=parseInt(orderData[0].statuts);
            res.json({
                code: 1,
                data:orderData[0],
                msg:"成功"
            }) 
            
        }
    })

})


// 支付宝回调
app.post('/payBack', (req, res) => {
    if(req.body.out_trade_no){

    }else{
        req.body.out_trade_no=req.body.xml.out_trade_no;
    }
    
    // console.log(req)
    console.log(req.body)
    // console.log(req.query)
    var  sql = "select * from orderlist where order_number = '"+req.body.out_trade_no+"'";
    //查
    connection.query(sql,function (err, orderData) {
        console.log(orderData)
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            res.json({
                code: 0,
                msg:"数据错误"
            }) 
            return;
        }
        if(orderData.length===0){
            res.json({
                code: 0,
                msg:"订单不存在"
            })
        }else{
            orderData=orderData[0];
            console.log(orderData.statuts)
            if(orderData.statuts==1){
                res.json({
                    code: 0,
                    msg:"订单已支付"
                })
                return;
            }


            var  sql = "select * from user WHERE userid = '"+orderData.userid+"'";
                //查
            connection.query(sql,function (err, userData) {
                if(err){
                    console.log('[SELECT ERROR] - ',err.message);
                    res.json({
                        code: 0,
                        msg:"参数错误"
                    }) 
                    return;
                }
                if(userData.length===0){
                    console.log("用户不存在")
                    res.json({
                        code: 0,
                        msg:"用户不存在"
                    }) 
                    return;
                }
                userData=userData[0];  
                console.log(userData)
                var timestamp = Date.parse(new Date());
                timestamp = timestamp / 1000;

                var time=Date.parse(userData.expiretime);
                time=(time/1000)-timestamp;
                if(time==null || !time || time<=0 || time==NaN){
                    if(orderData.viptype===1){
                        timestamp=timestampToTime(timestamp+(day*365));
                    }else{
                        timestamp=timestampToTime(timestamp+(day*30));
                        
                    }
                }else{
                    if(orderData.viptype===1){
                        timestamp=timestampToTime(timestamp+(day*365)+time)
                    }else{
                        timestamp=timestampToTime(timestamp+(day*30)+time)
                    }
                }
                var modSql = 'UPDATE user SET isvip = ? , expiretime = ?  WHERE userid = ?';
                var modSqlParams = [1,timestamp,orderData.userid];
                //添加vip
                connection.query(modSql,modSqlParams,function (err, UPdata) {
                    if(err){
                            console.log('[UPDATE ERROR] - ',err.message);
                            return;
                    }        
                    console.log('--------------------------UPDATE----------------------------');
                    var modSql = 'UPDATE orderlist SET statuts = ?  WHERE order_number = ?';
                    var modSqlParams = [1,req.body.out_trade_no];
                    //添加viporderlist
                    connection.query(modSql,modSqlParams,function (err, hh) {
                        if(err){
                                console.log('[UPDATE ERROR] - ',err.message);
                                return;
                        }        
                        console.log('--------------------------UPDATE----------------------------');
                        if(req.body.xml){
                                console.log('微信异步验签成功：')
                                res.send(wechat.success()) // 可以调用success或fail方法 返回结果
                             

                        }else{

                            if (alipay.verify(req.body)) { 
                                console.log('支付宝异步验签成功：')
                                res.send('SUCCESS')
                            } else {
                                console.log('支付宝异步验签失败：')
                                res.send('ERROR')
                              }
                        }
                    })      
                })      
            })
        }
    })
        
})

app.get('/payBack', (req, res) => {
    var  sql = "select * from orderlist";
    //查
    connection.query(sql,function (err, result) {
        if(err){
        console.log('[SELECT ERROR] - ',err.message);
            res.json({
                code: 0,
                msg:"参数错误"
            }) 
            return;
        }

        console.log(result)
    })
    console.log(req.query)
    console.log("支付回调")   
    res.json("支付回调") 
})



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
let server = app.listen(port, function () {
    if (ipaddress) {
        console.log(ipaddress + ':' + port + '服务器运行成功');
    } else {
        console.log('no networking, please open ' + ipaddress + ':' + port + ' in browser');
    }
});


// 随机生成订单
function token(len) {
    　　len = len || 32;
    　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    　　var maxPos = $chars.length;
    　　var pwd = '';
    　　for (i = 0; i < len; i++) {
    　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return pwd;
}
// 时间戳
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate()+1 < 10 ? '0'+(date.getDate() + ' ') : date.getDate() + ' ');
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y+M+D//+h+m+s;
}


// 每天凌晨执行任务(vip过期判断
var rule = new schedule.RecurrenceRule();
 
    rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    
    rule.hour = 0;
    
    rule.minute = 01;
    
    var j = schedule.scheduleJob(rule, function(){
    //  代码捎候
    console.log("执行任务");
    var  sql = 'SELECT * FROM user';
    //查
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        for(var i=0;i<result.length;i++){
            (function(i){
                var timestamp = (Date.parse(result[i].expiretime))/1000;
                var todayTime = Date.parse(new Date())/ 1000; 
                todayTime = timestampToTime(todayTime);
                todayTime = Date.parse(todayTime)/ 1000;
                if(timestamp-todayTime<0){
                    var modSql = 'UPDATE user SET isvip = ?, expiretime = ? WHERE userid = ?';
                    var modSqlParams = [0,null,result[i].userid];
                    connection.query(modSql,modSqlParams,function (err, result) {
                        if(err){
                            console.log('[UPDATE ERROR] - ',err.message);
                            return;
                        }        
                        console.log('--------------------------UPDATE----------------------------');
                    });
                }
            }(i))
        }
    })

})