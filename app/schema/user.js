'use strict'

const { User } = require('../service')

module.exports = {
  index: async (ctx, next) => {
    let username = ctx.params.name

    let user = await User.getByLoginName(username)
    if (!user) return ctx.renderError('这个用户不存在。')

    Object.assign(ctx.query, { user: user })

    return next()
  },
  listTopics: async (ctx, next) => {
    let username = ctx.params.name

    let user = await User.getByLoginName(username)
    if (!user) return ctx.renderError('这个用户不存在。')

    Object.assign(ctx.query, { user: user })

    return next()
  }
}
