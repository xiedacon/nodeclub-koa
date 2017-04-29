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
    let loginname = ctx.query.loginname;
    let email = ctx.query.email;
    let pass = ctx.query.pass;

    await User.newAndSave({
      name: loginname,
      loginname: loginname,
      pass: await tools.bhash(pass),
      email: email,
      avatar_url: tools.makeGravatar(email),
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
  activeAccount: () => {

  },
  showSearchPass: () => {},
  updateSearchPass: () => {},
  resetPass: () => {},
  updatePass: () => {}
};
