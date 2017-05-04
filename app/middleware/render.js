'use strict'

module.exports = (engine, options = {}) => {
  if (!engine) throw new Error(`Engine can't be null`)

  return (ctx, next) => {
    if (ctx.render || ctx.response.render) return next()

    ctx.render = ctx.response.render = async (relPath, locals = {}) => {
      let state = Object.assign({}, locals, options, ctx.state)
      let html = await engine(relPath, state)

      ctx.body = html
    }

    return next()
  }
}
