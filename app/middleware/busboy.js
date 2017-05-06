'use strict'

const Busboy = require('busboy')

const RE_MIME = /^(?:multipart\/.+)|(?:application\/x-www-form-urlencoded)$/i

module.exports = (options = {}) => {
  return (ctx, next) => {
    if (ctx.busboy ||
      ctx.method === 'GET' ||
      ctx.method === 'HEAD' ||
      !hasBody(ctx) ||
      !RE_MIME.test(mime(ctx))) return next()

    let config = Object.assign({}, options, { headers: ctx.headers })

    ctx.busboy = new Busboy(config)

    if (config.immediate) process.nextTick(() => { ctx.pipe(ctx.busboy) })

    return next()
  }
}

// utility functions copied from Connect

function hasBody (ctx) {
  let encoding = ctx.headers['transfer-encoding']
  let length = ctx.headers['content-length']
  return encoding || (length && length !== '0')
};

function mime (ctx) {
  return (ctx.headers['content-type'] || '').split(';')[0]
};
