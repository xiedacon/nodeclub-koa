'use strict'

module.exports = (ctx, next) => {
  ctx.renderError = (error, statusCode = 404, path = 'notify/notify') => {
    ctx.status = statusCode;
    return ctx.render(path, typeof error === 'string' ? {
      error: error
    } : error);
  }

  return next();
}
