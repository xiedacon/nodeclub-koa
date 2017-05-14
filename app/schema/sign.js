'use strict'
const validator = require('validator')
const { User } = require('../service')
const mail = require('../middleware/mail.js')
const tools = require('../common/tools.js')
const { session: { secret } } = require('config-lite')

module.exports = {
  signup: async (ctx, next) => {
    let loginname = validator.trim(ctx.request.body.loginname || '').toLowerCase()
    let email = validator.trim(ctx.request.body.email || '').toLowerCase()
    let pass = validator.trim(ctx.request.body.pass || '')
    let rePass = validator.trim(ctx.request.body.re_pass || '')

    // 验证信息的正确性
    let error =
      (([loginname, pass, rePass, email].some((item) => { return item === '' })) && '信息不完整。') ||
      ((loginname.length < 5) && '用户名至少需要5个字符。') ||
      ((!tools.validateId(loginname)) && '用户名不合法。') ||
      ((!validator.isEmail(email)) && '邮箱不合法。') ||
      ((pass !== rePass) && '两次密码输入不一致。')

    if (error) return ctx.renderError({ error: error, loginname: loginname, email: email }, 422, 'sign/signup')
    // END 验证信息的正确性

    let users = await User.findByQuery({ $or: [{ loginname: loginname }, { email: email }] })
    if (users.length > 0) return ctx.renderError({ error: '用户名或邮箱已被使用。', loginname: loginname, email: email }, 422, 'sign/signup')

    Object.assign(ctx.query, {
      loginname: loginname,
      email: email,
      pass: pass
    })

    return next()
  },
  login: async (ctx, next) => {
    let loginname = validator.trim(ctx.request.body.name || '').toLowerCase()
    let pass = validator.trim(ctx.request.body.pass || '')

    // 验证信息的正确性
    let error =
      (([loginname, pass].some((item) => { return item === '' })) && '信息不完整。') ||
      ((loginname.length < 5) && '用户名至少需要5个字符。') ||
      ((!tools.validateId(loginname) && !validator.isEmail(loginname)) && '用户名不合法。')

    if (error) return ctx.renderError(error, 422, 'sign/signin')
    // END 验证信息的正确性

    let user = await (validator.isEmail(loginname) ? User.getByMail(loginname) : User.getByLoginName(loginname))

    if (!user || !(await tools.bcompare(pass, user.pass))) return ctx.renderError('用户名或密码错误', 403, 'sign/signin')
    if (!user.active) {
      // 重新发送激活邮件
      mail.sendActiveMail(user.email, tools.md5(user.email + user.pass + secret), user.loginname)
      return ctx.renderError(`此帐号还没有被激活，激活链接已发送到 ${user.email} 邮箱，请查收。`, 403, 'sign/signin')
    }

    Object.assign(ctx.query, { user: user })

    return next()
  },
  activeAccount: async (ctx, next) => {
    let key = ctx.query.key
    let name = ctx.query.name

    let user = await User.getByLoginName(name)
    if (!user) throw new Error(`[ACTIVE_ACCOUNT] no such user: ${name}`)
    if (user.active) return ctx.renderError('帐号已经是激活状态。', 422)
    if (tools.md5(user.email + user.pass + secret) !== key) return ctx.renderError('信息有误，帐号无法被激活。', 422)

    Object.assign(ctx.query, { user: user })

    return next()
  },
  updateSearchPass: async (ctx, next) => {
    let email = validator.trim(ctx.request.body.email || '').toLowerCase()

    if (!validator.isEmail(email)) return ctx.renderError({ error: '邮箱不合法', email: email }, 422, 'sign/search_pass')

    let user = await User.getByMail(email)
    if (!user) return ctx.renderError({ error: '没有这个电子邮箱。', email: email }, 422, 'sign/search_pass')

    Object.assign(ctx.query, { user: user })

    return next()
  },
  resetPass: async (ctx, next) => {
    let key = validator.trim(ctx.request.body.key || '')
    let name = validator.trim(ctx.request.body.name || '')

    let user = await User.getByNameAndKey(name, key)
    if (!user) return ctx.renderError({ error: '信息有误，密码无法重置。' }, 403)

    let oneDay = 1000 * 60 * 60 * 24
    if (!user.retrieve_time || Date.now() - user.retrieve_time > oneDay) return ctx.render('notify/notify', { error: '该链接已过期，请重新申请。' })

    Object.assign(ctx.query, { name: name, key: key })

    return next()
  },
  updatePass: async (ctx, next) => {
    let pass = validator.trim(ctx.request.body.psw || '')
    let repass = validator.trim(ctx.request.body.repsw || '')
    let key = validator.trim(ctx.request.body.key || '')
    let name = validator.trim(ctx.request.body.name || '')

    if (pass === '') return ctx.render('sign/reset', { name: name, key: key, error: '密码不能为空' })
    if (pass !== repass) return ctx.render('sign/reset', { name: name, key: key, error: '两次密码输入不一致。' })

    let user = await User.getByNameAndKey(name, key)
    if (!user) return ctx.render('notify/notify', { error: '错误的激活链接' })

    Object.assign(ctx.query, { user: user, pass: pass })

    return next()
  },
  signout: (ctx, next) => {
    if (ctx.session.user) return next()
  }
}
