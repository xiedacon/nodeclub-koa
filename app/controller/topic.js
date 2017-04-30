'use strict'

module.exports = {
  create: async(ctx, next) => {
    await ctx.render('topic/edit');
    return next();
  },
  index: () => {},
  top: () => {},
  good: () => {},
  showEdit: () => {},
  lock: () => {},
  delete: () => {},
  put: () => {},
  update: () => {},
  collect: () => {},
  de_collect: () => {},
  upload: () => {}
};
