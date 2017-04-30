'use strict'

module.exports = {
  userRequired: (ctx, next) => {
    if (!ctx.session || !ctx.session.user || !ctx.session.user._id) {
      ctx.status = 403;
      ctx.body = 'forbidden!'
      return false;
    }
    return next();
  }
};
