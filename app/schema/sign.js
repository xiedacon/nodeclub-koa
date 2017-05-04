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

    Object.assign(ctx.query, {
      user: user
    })
    return next()
  }
}
