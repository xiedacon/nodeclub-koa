'use strict'

const { User } = require('../service')
const helper = require('./helper.js')
const validator = require('validator')
const tools = require('../common/tools.js')

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
  },
  listCollectedTopics: async (ctx, next) => {
    let username = ctx.params.name

    let user = await User.getByLoginName(username)
    if (!user) return ctx.renderError('这个用户不存在。')

    Object.assign(ctx.query, { user: user })

    return next()
  },
  showSetting: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return

    return next()
  },
  setting: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return
    let action = validator.trim(ctx.request.body.action || '')

    if (action === 'change_setting') {
      let url = validator.trim(ctx.request.body.url || '')
      let location = validator.trim(ctx.request.body.location || '')
      let weibo = validator.trim(ctx.request.body.weibo || '')
      let signature = validator.trim(ctx.request.body.signature || '')
      let user = ctx.session.user

      user.url = url
      user.location = location
      user.weibo = weibo
      user.signature = signature
      Object.assign(ctx.query, { action: action, user: user })

      return next()
    }
    if (action === 'change_password') {
      let oldPass = validator.trim(ctx.request.body.old_pass || '')
      let newPass = validator.trim(ctx.request.body.new_pass || '')
      let user = ctx.session.user

      if (!oldPass || !newPass) return ctx.renderError(Object.assign({ error: '旧密码或新密码不得为空' }, user.toObject({ virtual: true })), 422, 'user/setting')
      if (!await tools.bcompare(oldPass, user.pass)) return ctx.renderError(Object.assign({ error: '当前密码不正确。' }, user.toObject({ virtual: true })), 422, 'user/setting')

      user.pass = await tools.bhash(newPass)
      Object.assign(ctx.query, { action: action, user: user })

      return next()
    }

    return ctx.send({ success: 'failed', message: '不支持的action类型' }, 422)
  }
}
