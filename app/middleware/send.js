'use strict'

module.exports = (ctx, next) => {
  ctx.send = (data, statusCode = 200) => {
    ctx.body = data
    ctx.status = statusCode
  }

  return next()
}
