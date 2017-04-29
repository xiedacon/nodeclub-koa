'use strict'
const logger = require('./logger.js');

exports = module.exports = function(ctx, next) {
  let t = new Date();
  let req = ctx.request;
  let res = ctx.response;
  logger.info('\n\nStarted', t.toISOString(), req.method, req.url, req.ip);

  ctx.res.on('finish', function() {
    logger.info('Completed', res.status, `'(${Date.now() - t.getTime()}ms)'`.green);
  });

  return next();
};
