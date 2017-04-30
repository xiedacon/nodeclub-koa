'use strict'
const validator = require('validator');
const tools = require('../common/tools.js');
const User = require('../service').User;
const auth = require('../middleware/auth.js');
const mail = require('../middleware/mail.js');
const secret = require('config-lite').session.secret;
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
    let loginname = ctx.query.loginname;
    let email = ctx.query.email;
    let pass = await tools.bhash(ctx.query.pass);

    await User.newAndSave({
      name: loginname,
      loginname: loginname,
      pass: pass,
      email: email,
      avatar_url: tools.makeGravatar(email),
      active: false
    });

    // 发送激活邮件
    await mail.sendActiveMail(email, tools.md5(email + pass + secret), loginname);

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
    let user = ctx.query.user;
    // store session cookie for 30 days
    auth.gen_session(user._id, ctx);
    //check at some page just jump to home page
    var refer = ctx.session._loginReferer || '/';
    refer = notJump.find((uri) => {
      return refer.indexOf(uri) >= 0;
    }) ? '/' : refer;
    ctx.redirect(refer);
  },
  activeAccount: async(ctx, next) => {
    let key = ctx.query.key;
    let name = ctx.query.name;

    let user = await User.getByLoginName(name);

    if (!user) return next(new Error(`[ACTIVE_ACCOUNT] no such user: ${name}`));

    if (tools.md5(user.email + user.pass + secret) !== key) {
      return ctx.render('notify/notify', {
        error: '信息有误，帐号无法被激活。'
      });
    }
    if (user.active) {
      return ctx.render('notify/notify', {
        error: '帐号已经是激活状态。'
      });
    }

    user.active = true;
    await user.save();

    await ctx.render('notify/notify', {
      success: '帐号已被激活，请登录'
    });

    return next();
  },
  showSearchPass: () => {},
  updateSearchPass: () => {},
  resetPass: () => {},
  updatePass: () => {}
};
