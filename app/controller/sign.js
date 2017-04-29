'use strict'
const validator = require('validator');
const tools = require('../common/tools.js');
const User = require('../service').User;
const auth = require('../middleware/auth.js');
const mail = require('../middleware/mail.js');
const siteName = require('config-lite').site.name;
const notJump = [
  '/active_account', //active page
  '/reset_pass', //reset password page, avoid to reset twice
  '/signup', //regist page
  '/search_pass' //serch pass page
];

module.exports = {
  showSignup: async(ctx, next) => {
    await ctx.render('sign/signup');
    return next();
  },
  signup: async(ctx, next) => {
    let loginname = validator.trim(ctx.request.body.loginname).toLocaleLowerCase();
    let email = validator.trim(ctx.request.body.email).toLowerCase();
    let pass = validator.trim(ctx.request.body.pass);
    let rePass = validator.trim(ctx.request.body.re_pass);
    let error;

    // 验证信息的正确性
    if ([loginname, pass, rePass, email].some((item) => {
        return item === '';
      })) {
      error = '信息不完整。';
    }
    if (!error && loginname.length < 5) {
      error = '用户名至少需要5个字符。';
    }
    if (!error && !tools.validateId(loginname)) {
      error = '用户名不合法。';
    }
    if (!error && !validator.isEmail(email)) {
      error = '邮箱不合法。';
    }
    if (!error && pass !== rePass) {
      error = '两次密码输入不一致。';
    }
    if (error) {
      ctx.status = 422;
      await ctx.render('sign/signup', {
        error: error,
        loginname: loginname,
        email: email
      });
      return next();
    }
    // END 验证信息的正确性

    let users = await User.findByQuery({
      '$or': [{
          loginname: loginname
        },
        {
          email: email
        }
      ]
    });

    if (users.length > 0) {
      ctx.status = 422;
      await ctx.render('sign/signup', {
        error: '用户名或邮箱已被使用。',
        loginname: loginname,
        email: email
      });
      return next();
    }

    pass = await tools.bhash(pass);

    let avatarUrl = tools.makeGravatar(email);

    await User.newAndSave({
      name: loginname,
      loginname: loginname,
      pass: pass,
      email: email,
      avatar_url: avatarUrl,
      active: true
    });

    // 发送激活邮件
    await mail.sendActiveMail(email, pass, loginname);

    await ctx.render('sign/signup', {
      success: true
    });

    return next();
  },
  signout: async(ctx, next) => {
    auth.des_session(ctx);
    ctx.redirect('/');
  },
  showLogin: async(ctx, next) => {
    ctx.session._loginReferer = ctx.headers.referer;
    await ctx.render('sign/signin');
    return next();
  },
  login: async(ctx, next) => {
    let loginname = validator.trim(ctx.request.body.name).toLowerCase();
    let pass = validator.trim(ctx.request.body.pass);
    let error;

    // 验证信息的正确性
    if ([loginname, pass].some((item) => {
        return item === '';
      })) {
      error = '信息不完整。';
    }
    if (!error && loginname.length < 5) {
      error = '用户名至少需要5个字符。';
    }
    if (!error && !tools.validateId(loginname)) {
      error = '用户名不合法。';
    }
    if (error) {
      ctx.status = 422;
      await ctx.render('sign/signin', {
        error: error
      });
      return next();
    }
    // END 验证信息的正确性

    let user = await (validator.isEmail(loginname) ? User.getByMail(loginname) : User.getByLoginName(loginname));

    if (!user || !(await tools.bcompare(pass, user.pass))) {
      ctx.status = 403;
      ctx.render('sign/signin', {
        error: '用户名或密码错误'
      });
      return next();
    }
    if (!user.active) {

      // 重新发送激活邮件
      await mail.sendActiveMail(user.email, user.email, user.loginname);
      ctx.status = 403;
      return ctx.render('sign/signin', {
        error: '此帐号还没有被激活，激活链接已发送到 ${user.email} 邮箱，请查收。'
      });
    }

    // store session cookie for 30 days
    auth.gen_session(user, ctx);
    //check at some page just jump to home page
    var refer = ctx.session._loginReferer || '/';
    refer = notJump.find((uri) => {
      return refer.indexOf(uri) >= 0;
    }) ? '/' : refer;
    ctx.redirect(refer);
  },
  activeAccount: () => {

  },
  showSearchPass: () => {},
  updateSearchPass: () => {},
  resetPass: () => {},
  updatePass: () => {}
};
