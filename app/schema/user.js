'use strict'

const { User } = require('../service')
const helper = require('./helper.js')

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
  },
  listReplies: async (ctx, next) => {
    let username = ctx.params.name

    let user = await User.getByLoginName(username)
    if (!user) return ctx.renderError('这个用户不存在。')

    Object.assign(ctx.query, { user: user })

    return next()
  },
  toggleStar: async (ctx, next) => {
    if (!helper.userRequired(ctx) || !ctx.session.user.is_admin) return
    let userId = ctx.request.body.user_id

    let user = await User.getById(userId)
    if (!user) return ctx.send({ status: 'failed', message: 'user is not exists' })

    Object.assign(ctx.query, { user: user })

    return next()
  },
  block: async (ctx, next) => {
    if (!helper.userRequired(ctx) || !ctx.session.user.is_admin) return
    let username = ctx.params.name

    let user = await User.getByLoginName(username)
    if (!user) return ctx.send({ status: 'failed', message: 'user is not exists' })

    Object.assign(ctx.query, { user: user })

    return next()
  },
  deleteAll: async (ctx, next) => {
    if (!helper.userRequired(ctx) || !ctx.session.user.is_admin) return
    let username = ctx.params.name

    let user = await User.getByLoginName(username)
    if (!user) return ctx.send({ status: 'failed', message: 'user is not exists' })

    Object.assign(ctx.query, { user: user })

    return next()
  }
}
