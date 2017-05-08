'use strict'
const tools = require('../common/tools.js')
const { User } = require('../service')
const auth = require('../middleware/auth.js')
const mail = require('../middleware/mail.js')
const uuid = require('uuid')
const secret = require('config-lite').session.secret
const notJump = [
  '/active_account', // active page
  '/reset_pass', // reset password page, avoid to reset twice
  '/signup', // regist page
  '/search_pass' // serch pass page
]

module.exports = {
  showSignup: (ctx) => {
    return ctx.render('sign/signup')
  },
  signup: (ctx) => {
    let loginname = ctx.query.loginname
    let email = ctx.query.email
    let pass = ctx.query.pass

    return Promise.all([
      (async () => {
        await User.newAndSave({
          name: loginname,
          loginname: loginname,
          pass: (pass = await tools.bhash(pass)),
          email: email,
          avatar_url: tools.makeGravatar(email),
          active: false
        })

        // 发送激活邮件
        mail.sendActiveMail(email, tools.md5(email + pass + secret), loginname)
      })(),
      ctx.render('sign/signup', {
        success: true
      })
    ])
  },
  signout: (ctx) => {
    auth.des_session(ctx)
    ctx.redirect('/')
  },
  showLogin: (ctx) => {
    ctx.session._loginReferer = ctx.headers.referer
    return ctx.render('sign/signin')
  },
  login: (ctx) => {
    let user = ctx.query.user
    // store session cookie for 30 days
    auth.gen_session(user._id, ctx)
    // check at some page just jump to home page
    var refer = ctx.session._loginReferer || '/'
    refer = notJump.find((uri) => {
      return refer.indexOf(uri) >= 0
    }) ? '/' : refer
    ctx.redirect(refer)
  },
  activeAccount: async (ctx) => {
    let key = ctx.query.key
    let name = ctx.query.name

    let user = await User.getByLoginName(name)

    if (!user) throw new Error(`[ACTIVE_ACCOUNT] no such user: ${name}`)

    if (tools.md5(user.email + user.pass + secret) !== key) {
      return ctx.renderError('信息有误，帐号无法被激活。', 422)
    }
    if (user.active) {
      return ctx.renderError('帐号已经是激活状态。', 422)
    }

    user.active = true

    return Promise.all([
      User.update(
        { _id: user.id },
        { active: user.active }
      ),
      ctx.render('notify/notify', {
        success: '帐号已被激活，请登录'
      })
    ])
  },
  showSearchPass: (ctx) => {
    return ctx.render('sign/search_pass')
  },
  updateSearchPass: async (ctx) => {
    let user = ctx.query.user
    // 动态生成retrive_key和timestamp到users collection,之后重置密码进行验证
    let retrieveKey = uuid.v4()
    let retrieveTime = Date.now()

    await User.update(
      { _id: user._id },
      { retrieve_key: retrieveKey, retrieve_time: retrieveTime }
    )

    mail.sendResetPassMail(user.email, retrieveKey, user.loginname)

    return ctx.render('notify/notify', { success: '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。' })
  },
  resetPass: (ctx) => {
    let key = ctx.query.key
    let name = ctx.query.name

    return ctx.render('sign/reset', { name: name, key: key })
  },
  updatePass: () => { }
}
