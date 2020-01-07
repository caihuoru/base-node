// 封装原生js ajax
function ajax() {
    var ajaxData = {
        type: arguments[0].type || "GET",
        url: arguments[0].url || "",
        async: arguments[0].async || "true",
        data: arguments[0].data || null,
        dataType: arguments[0].dataType || "text",
        contentType: arguments[0].contentType || "application/x-www-form-urlencoded",
        beforeSend: arguments[0].beforeSend || function () { },
        success: arguments[0].success || function () { },
        error: arguments[0].error || function () { }
    }
    ajaxData.beforeSend()
    var xhr = createxmlHttpRequest();
    xhr.responseType = ajaxData.dataType;
    xhr.open(ajaxData.type, ajaxData.url, ajaxData.async);
    xhr.setRequestHeader("Content-Type", ajaxData.contentType);
    xhr.send(convertData(ajaxData.data));
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                ajaxData.success(xhr.response)
            } else {
                ajaxData.error()
            }
        }
    }
}

function createxmlHttpRequest() {
    if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP");
    } else if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }
}

function convertData(data) {
    if (typeof data === 'object') {
        var convertResult = "";
        for (var c in data) {
            convertResult += c + "=" + data[c] + "&";
        }
        convertResult = convertResult.substring(0, convertResult.length - 1)
        return convertResult;
    } else {
        return data;
    }
}




// 渠道2
ajax({
    url: "//foundjoy.ltd:8021/get/url?channel=chr",
    // url: "http://192.168.1.186:8021/get/url?channel=2",
    type: "get",
    dataType: "json",
    success: function (res) {

        let oInput = document.createElement('input')
        let add_div = document.createElement('div')

        oInput.style.display = 'inline-block'
        add_div.style.cssText = "position:fixed;width:100%;height:100%;top:0;left:0;cursor: pointer;"
        oInput.value = res.copy_link;
        document.body.appendChild(oInput)
        document.body.appendChild(add_div)
        add_div.onclick = function () {



            oInput.select()
            document.execCommand("Copy")

            console.log(oInput)
            document.body.removeChild(oInput)
            document.body.removeChild(add_div)
        }
        // document.onclick()


    }
})