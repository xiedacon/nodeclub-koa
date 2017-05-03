'use strict'

const logger = require('./logger.js')

// Patch ctx.render method to output logger
module.exports = (ctx, next) => {
  let render = ctx.render;

  ctx.render = async function() {
    let t = Date.now();
    await render.apply(ctx, arguments);
    logger.info("Render view", arguments[0], `(${Date.now() - t}ms)`.green);
  }

  return next();
}
