'use strict'
const validator = require('validator')
const { User } = require('../service')
const mail = require('../middleware/mail.js')
const tools = require('../common/tools.js')
const secret = require('config-lite').session.secret

module.exports = {
  signup: async (ctx, next) => {
    let loginname = validator.trim(ctx.request.body.loginname).toLocaleLowerCase()
    let email = validator.trim(ctx.request.body.email).toLowerCase()
    let pass = validator.trim(ctx.request.body.pass)
    let rePass = validator.trim(ctx.request.body.re_pass)
    let error

    // 验证信息的正确性
    if ([loginname, pass, rePass, email].some((item) => {
      return item === ''
    })) {
      error = '信息不完整。'
    }
    if (!error && loginname.length < 5) {
      error = '用户名至少需要5个字符。'
    }
    if (!error && !tools.validateId(loginname)) {
      error = '用户名不合法。'
    }
    if (!error && !validator.isEmail(email)) {
      error = '邮箱不合法。'
    }
    if (!error && pass !== rePass) {
      error = '两次密码输入不一致。'
    }
    if (error) {
      return ctx.renderError({
        error: error,
        loginname: loginname,
        email: email
      }, 422, 'sign/signup')
    }
    // END 验证信息的正确性

    let users = await User.findByQuery({
      '$or': [{
        loginname: loginname
      }, {
        email: email
      }]
    })

    if (users.length > 0) {
      return ctx.renderError({
        error: '用户名或邮箱已被使用。',
        loginname: loginname,
        email: email
      }, 422, 'sign/signup')
    }

    Object.assign(ctx.query, {
      loginname: loginname,
      email: email,
      pass: pass
    })
    return next()
  },
  login: async (ctx, next) => {
    let loginname = validator.trim(ctx.request.body.name).toLowerCase()
    let pass = validator.trim(ctx.request.body.pass)
    let error

    // 验证信息的正确性
    if ([loginname, pass].some((item) => {
      return item === ''
    })) {
      error = '信息不完整。'
    }
    if (!error && loginname.length < 5) {
      error = '用户名至少需要5个字符。'
    }
    if (!error && !tools.validateId(loginname)) {
      error = '用户名不合法。'
    }
    if (error) {
      return ctx.renderError(error, 422, 'sign/signin')
    }
    // END 验证信息的正确性
    let user = await (validator.isEmail(loginname) ? User.getByMail(loginname) : User.getByLoginName(loginname))

    if (!user || !(await tools.bcompare(pass, user.pass))) {
      return ctx.renderError('用户名或密码错误', 403, 'sign/signin')
    }
    if (!user.active) {
      // 重新发送激活邮件
      mail.sendActiveMail(user.email, tools.md5(user.email + user.pass + secret), user.loginname)
      return ctx.renderError(`此帐号还没有被激活，激活链接已发送到 ${user.email} 邮箱，请查收。`, 403, 'sign/signin')
    }

    Object.assign(ctx.query, { user: user })
    return next()
  },
  updateSearchPass: async (ctx, next) => {
    let email = validator.trim(ctx.request.body.email).toLowerCase()
    if (!validator.isEmail(email)) return ctx.render('sign/search_pass', { error: '邮箱不合法', email: email })

    let user = await User.getByMail(email)
    if (!user) return ctx.render('sign/search_pass', { error: '没有这个电子邮箱。', email: email })

    Object.assign(ctx.query, { user: user })

    return next()
  },
  resetPass: async (ctx, next) => {
    let key = validator.trim(ctx.request.body.key || '')
    let name = validator.trim(ctx.request.body.name || '')

    let user = await User.getByNameAndKey(name, key)
    if (!user) return ctx.renderError({ error: '信息有误，密码无法重置。' }, 403)
    let now = Date.now()
    let oneDay = 1000 * 60 * 60 * 24
    if (!user.retrieve_time || now - user.retrieve_time > oneDay) return ctx.render('notify/notify', { error: '该链接已过期，请重新申请。' })

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
  }
}
