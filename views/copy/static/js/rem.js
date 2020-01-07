window.onload = function() {
    // 375宽开发 14默认字体
    getRem(375, 16);
  };
  window.onresize = function() {
    // 调试用到
    // getRem(375,14)
  };
  getRem(375, 16);
  function getRem(pwidth, prem) {
    var html = document.getElementsByTagName("html")[0];
    var oWidth =
      document.body.clientWidth || document.documentElement.clientWidth;
    // console.log(oWidth);
    if (oWidth >= 750) {
      oWidth = 750;
    } else if (oWidth <= 320) {
      oWidth = 320;
    }
    html.style.fontSize = (oWidth / pwidth) * prem + "px";
    $(".main").show();
  }
  
  
  
  //解决safari自带放大功能：阻止双击放大
  document.addEventListener('touchstart',function (event) {
    if(event.touches.length>1){
      event.preventDefault();
    }
  });
  var lastTouchEnd=0;
  document.addEventListener('touchend',function (event) {
    var now=(new Date()).getTime();
    if(now-lastTouchEnd<=300){
      event.preventDefault();
    }
    lastTouchEnd=now;
  },false);
  document.addEventListener('gesturestart', function (event) {
    event.preventDefault();
  });
  