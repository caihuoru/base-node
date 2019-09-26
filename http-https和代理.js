const express = require('express')
const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const net = require('net')

// 根据项目的路径导入生成的证书文件
const privateKey = fs.readFileSync(path.join(__dirname, './pem/ou1.key'), 'utf8')
const certificate = fs.readFileSync(path.join(__dirname, './pem/ou1.crt'), 'utf8')
const credentials = {
    key: privateKey,
    cert: certificate,
}
// 设置https的访问端口号
const SSLPORT = 8098
// 设置http的访问端口号
const PORT = 8099
// 创建express实例
const app = express()

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
        } else {
            postData = querystring.parse(postData)
        }
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
        res.redirect('https://foundjoy.ltd:7000' + req.originalUrl);
    }
})

// 处理请求
// app.get('/', async (req, res) => {
//     res.status(200).send('Hello World!')
// })

app.get('/', function (req, res, next) {
    res.status(200).send('Hello World!')
});

app.get('/data', function (req, res, next) {
    res.send('isok')
});

// 创建https服务器实例
const httpsServer = https.createServer(credentials, app)
const httpServer = http.createServer(app)



// 启动服务器，监听对应的端口
httpsServer.listen(SSLPORT, () => {
    console.log(`HTTPS Server is running on: https://localhost:${SSLPORT}`)
})
httpServer.listen(PORT, () => {
    console.log(`HTTP Server is running on: https://localhost:${PORT}`)
})

// 2、创建服务器进行代理
net.createServer(function (socket) {
    socket.once('data', function (buf) {
        console.log(buf[0]);
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
}, app).listen(7000); // 此处是真正能够访问的端口，网站默认是80端口。
