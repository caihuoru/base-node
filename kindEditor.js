var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
// var bodyParser = require('body-parser');
// app.use(express.bodyParser({ uploadDir: './public/upload' }));
app.use(express.static(__dirname + '/'));
var port = 8088;
var formidable = require('formidable');

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    if (req.method == "OPTIONS") {
        res.sendStatus(200);/*让options请求快速返回*/
    } else {
        next();
    }
});

app.get('/', function (req, res, next) {
    res.json("...正在完善");
});
app.post('/uploadImg', function (req, res, next) {
    var form = new formidable.IncomingForm({ keepExtensions: true });


    form.uploadDir = path.join(__dirname + '/public/upload/');
    form.maxFieldsSize = 10000 * 1024 * 1024
    // form.uploadDir = __dirname + '/public/upload';
    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        }
        //fields存放的为json数据
        //files存放的是文件信息
        //更改文件目录,并且显示上传之前的名字
        fs.rename(files.file.path, __dirname + '/public/upload/' + files.file.name, function (a, b) {

        });
        //form.parse(request, [callback]) 该方法会转换请求中所包含的表单数据，callback会包含所有字段域和文件信息



        // console.log(files)
        var image = files.file;
        // var image = files.imgFile;  //这是整个files流文件对象,是转换成有利于传输的数据格式
        var path_ = image.path;      //从本地上传的资源目录加文件名:如E:\\web\\blog\\upload\\upload_0a14.jpg
        /*下面这里是通过分割字符串来得到文件名*/
        var arr = path_.split('\\');//注split可以用字符或字符串分割
        var name = arr[arr.length - 1];
        /*上面这里是通过分割字符串来得到文件名*/
        var url = 'http://' + getIPAdress() + `:${port}/public/upload/` + files.file.name;
        console.log(url);
        var info = {
            "error": 0,
            "url": url
        };

        // 改名字
        // fs.rename(url, newpath, function (err) {
        //     if (err) {
        //         throw Error("改名失败");
        //     }
        //info是用来返回页面的图片地址
        res.send(info);
        // });

    })
})

let server = app.listen(port, function () {

    console.log('服务器运行成功端口:' + port);

});
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