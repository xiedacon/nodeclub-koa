'use strict'
const config = require('config-lite');
const cookie = config.cookie;
const adminNames = config.admin.names;
const Message = require('../service').Message;
const User = require('../service').User;
const UserModel = require('mongoose').model('User');
const separator = '$$$$';

module.exports = {
  blockUser: (ctx, next) => {
    if (ctx.path !== '/signout' && ctx.session.user && ctx.session.user.is_block && ctx.method !== 'GET') {
      ctx.status = 403;
      ctx.body = '您已被管理员屏蔽了。有疑问请联系 @alsotang。';
      return;
    }

    return next();
  },
  authUser: async(ctx, next) => {
    let user = ctx.session.user;
    let auth_token = ctx.cookies.get(cookie.name, {
      signed: true
    });
    
    if (!user && auth_token) {
      let user_id = auth_token.split(separator)[0];
      if(user_id !== 'undefined')
        user = ctx.session.user = await User.getById(user_id);
    }
    
    if (user) {
      user = new UserModel(user);
      if (adminNames.indexOf(user.loginname) >= 0) {
        user.is_admin = true;
      }

      user.messages_count = await Message.getCountById(user._id);
      ctx.state.current_user = user;
    }
    
    return next();
  },
  gen_session: (userId, ctx) => {
    let auth_token = userId + separator; // 以后可能会存储更多信息，用 $$$$ 来分隔
    ctx.cookies.set(cookie.name, auth_token, cookie); //cookie 有效期30天
  },
  des_session: (ctx) => {
    ctx.cookies.set(cookie.name, { path: cookie.path });
    ctx.session = undefined;
  }
};
