const config = {
  errorBagName: 'errors', // change if property conflicts.
  fieldsBagName: 'fieldBags',  // 报冲突时 可自定义修改字段名称
  delay: 0, // 错误提示的延迟时间
  strict: true, // 没有设置规则的表单不进行校验，
  enableAutoClasses: false,
  locale: 'zh_CN', // 对语言（中文）的配置
  classNames: {
    touched: 'touched', // the control has been blurred
    untouched: 'untouched', // the control hasn't been blurred
    valid: 'valid', // model is valid
    invalid: 'invalid', // model is invalid
    pristine: 'pristine', // control has not been interacted with
    dirty: 'dirty' // control has been interacted with
  },
  events: 'input|blur', //* *input|blur** 在用户输入和表单失去焦点时都进行校验 可单独写  blur或input
  inject: true
}
//引入vue后，需要添加vee-validata的js和语言包文件(目前只用中文)
//js使用方式，指定语言、修改默认提示，添加自定义验证
VeeValidate.Validator.localize({
  zh_CN: {
    messages: {
      required: function (name) {
        return name + "不能为空！";
      },
      money: function (name) {
        // 因为验证目前发现只能返回false 没法返回状态码 所以false之后再查一遍具体哪里出错
        let min_money = app.add.min_money;
        let max_money = app.add.max_money;
        let value = app.add.money;
        if(!min_money || !max_money) {
          return '请先填写最大最小支付值'
        }
        if(/[^0-9.,]/.test(value)){
          return '只能填写数字和英文 , 逗号'
        }
        let type = 0,text = 0;
        let arr = value.split(',')
        for(let i in arr) {
          let item = arr[i];
          if(item.indexOf('.') > 0 && item.length - item.indexOf('.') > 3){
            type = 1
            break
          }
          item = parseFloat(arr[i])
          if(item<min_money){
            type = 2
            text = item
            break
          }
          if(item>max_money){
            type = 3
            text = item
            break
          }
        }
        switch (type) {
          case 1:
            return '只能出现小数点两位'
            break
          case 2:
            return '"'+text+'" 不能小于最小支付值'
            break
          case 3:
            return '"'+text+'" 不能大于最大支付值'
            break
        }
        return '格式出错'
      },
      moneyLimit: function (name,type) {
        return '请先填写最大最小支付值'
      },
      email: function () {
        return "邮箱格式无效"
      },
      mobile: function () {
        return "必须是11位手机号码"
      },
      repeat: function () {
        return "两次密码不一致！"
      },
      min_value: function (name, min) {
        console.log(name, min)
        let unit = ""
        switch (name) {
          case 'danjia':
            name = '悬赏单价'
            unit = '元/人'
            break
          case 'geshu':
            name = '悬赏个数'
            unit = '人'
            break
        }
        return name + '最少需要' + min[0] + unit
      },
    },
    // 设置提示的名词
    attributes: {
      username: '渠道名称',
      password: '密码',
      account_number: '账号',
      platName: '平台名称',
      min_money: '最小支付值',
      max_money: '最大支付值',
      filepath: '文件路径',
      sort: '排序',
      money: '可充值金额',
    }
  }

});
// 自定义验证规则
// 重复验证密码
VeeValidate.Validator.extend('repeat', {
  validate: function (value) {
    return app.repeat == app.pass_word;
  }
});
VeeValidate.Validator.extend('mobile', {
  messages: {
    en: field => field + '必须是11位手机号码',
  },
  validate: value => {
    return value.length == 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/.test(value)
  }
});
VeeValidate.Validator.extend('money', {
  validate: (value, args) => {
    let min_money = parseFloat(app.add.min_money);
    let max_money = parseFloat(app.add.max_money);
    if(!app.add.min_money || !app.add.max_money) {
      console.log('请先填写最大最小支付值')
      return false
    }
    if(/[^0-9.,]/.test(value)){
      console.log('只能填写数字和英文 , 逗号')
      return false
    }
    let type = 0;
    let arr = value.split(',')
    for(let i in arr) {
      let item = arr[i];
      if(item.indexOf('.') > 0 && item.length - item.indexOf('.') > 3){
        console.log('只能出现小数点两位:',item)
        type = 1
        break
      }
      item = parseFloat(arr[i])
      if(item<min_money){
        console.log('不能小于最小支付值:',item,min_money)
        type = 2
        break
      }
      if(item>max_money){
        console.log('不能大于最大支付值:',item,max_money)
        type = 3
        break
      }
    }
    if(type > 0){
      return false
    }
    return true
  }
});
Vue.use(VeeValidate, config);
