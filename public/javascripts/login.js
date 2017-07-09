/**
 * login 模块
 */
;(function (window, $) {
  $(function () {
    // $('#js_signinForm').on('submit', function() {
    //   var login_code = page.$userInput.val(),
    //     password = page.$passInput.val(),
    //     ip = '192.168.1.155',
    //     address = '厦门市思明区软件园二期望海路55号303';
    //
    //   // validate verification code
    //   if (!$.idcode.validateCode()) {
    //     alert('验证码出错!');
    //     return false;
    //   }
    //
    //   self.$loginBtn.text('登陆中...');
    //   if (self.$loginBtn.hasClass('loading-status')) return;
    //   self.$loginBtn.toggleClass('loding-status', true);
    //   $.post('http://occtest1.iwop.cn/biz/user/login?' + $('#js_signinForm').serialize()).done(function(res) {
    //     if (res.Code !== '0') {
    //       alert('登陆失败');
    //       return;
    //     }
    //     var account = JSON.parse(res.Result);
    //     // write cookie
    //     $.cookie('user_id', account.userId);
    //     $.cookie('user_name', account.userName);
    //     $.cookie('roleType', account.roleType.code);
    //     $.cookie('is_login', true);
    //     window.location.replace('home.html');
    //   }).always(function () {
    //     self.$loginBtn.text('登陆');
    //     self.$loginBtn.removeClass('loading-status');
    //   });
    //   return false;
    // });

    $('#J_submit').on('click', function() {
      var userName = $('#J_userName').val(),
        passwd = $('#J_passwd').val(),
        params = {};

      params.username = userName
      params.password = passwd
      console.log(passwd)
      $.post('/login', params)
        .done(function (res) {
          console.log(res)
          if (res.code === '0') {
            window.localStorage.setItem('token', res.token)
            window.location.href = 'index.html'
          }
        })

      return false;
    })
  })
})(window, jQuery,)
