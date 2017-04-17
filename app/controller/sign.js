'use strict'
const validator = require('validator');
const tools = require('../common/tools.js');
const User = require('../service').User;

module.exports = {
  showSignup: async(ctx, next) => {
    await ctx.render('sign/signup');
    return next();
  },
  signup: async(ctx, next) => {
    let loginname = validator.trim(ctx.request.body.loginname).toLocaleLowerCase(),
      email = validator.trim(ctx.request.body.email).toLowerCase(),
      pass = validator.trim(ctx.request.body.pass),
      rePass = validator.trim(ctx.request.body.re_pass),
      error;

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
    console.log(users)
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
    //       mail.sendActiveMail(email, utility.md5(email + passhash + config.session_secret), loginname);
    //       res.render('sign/signup', {
    //         success: '欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'
    //       });

    return next();
  },
  signout: () => {},
  showLogin: async(ctx, next) => {
    await ctx.render('sign/signin');
    return next();
  },
  login: async(ctx, next) => {
    let loginname = validator.trim(ctx.request.body.name).toLowerCase(),
      pass = validator.trim(ctx.request.body.pass),
      error;

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

    let user = await(validator.isEmail(loginname) ? User.getByMail(loginname) : User.getByLoginName(loginname));

    if (!user || !(await tools.bcompare(pass, user.pass))) {
      ctx.status = 403;
      ctx.render('sign/signin', {
        error: '用户名或密码错误' 
      });
      return next();
    }

    if(!user.active){
      // // 重新发送激活邮件
      // mail.sendActiveMail(user.email, utility.md5(user.email + passhash + config.session_secret), user.loginname);
      // res.status(403);
      // return res.render('sign/signin', { error: '此帐号还没有被激活，激活链接已发送到 ' + user.email + ' 邮箱，请查收。' });  
    }

    // store session cookie
    authMiddleWare.gen_session(user, res);
    //check at some page just jump to home page
    var refer = req.session._loginReferer || '/';
    for (var i = 0, len = notJump.length; i !== len; ++i) {
      if (refer.indexOf(notJump[i]) >= 0) {
        refer = '/';
        break;
      }
    }
    res.redirect(refer);
  },
  activeAccount: () => {},
  showSearchPass: () => {},
  updateSearchPass: () => {},
  resetPass: () => {},
  updatePass: () => {}
};
