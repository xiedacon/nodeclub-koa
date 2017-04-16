'use strict'

module.exports = {
  showSignup: async (ctx, next) => {
    await ctx.render('sign/signup');
    return next();
  },
  signup: (ctx, next) => {
    
  },
  signout: () => {},
  showLogin: async (ctx, next) => {
    await ctx.render('sign/signin');
    return next();
  },
  login: () => {},
  activeAccount: () => {},
  showSearchPass: () => {},
  updateSearchPass: () => {},
  resetPass: () => {},
  updatePass: () => {}
};
