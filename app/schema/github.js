'use strict'

const { User } = require('../service')
const validator = require('validator')
const tools = require('../common/tools.js')

module.exports = {
  callback: async (ctx, next) => {
    let profile = ctx.state.user
    let email = profile.emails && profile.emails[0] && profile.emails[0].value

    // 如果用户还未存在，则建立新用户
    let user = await User.getByGitHubId(profile.id)
    if (!user) {
      ctx.session.profile = profile
      return ctx.redirect('/auth/github/new')
    }
    if (!email || email === '' || (user.email !== email && await User.getByMail(email))) return ctx.renderError({}, 500, 'sign/no_github_email')

    // 当用户已经是 cnode 用户时，通过 github 登陆将会更新他的资料
    user.githubUsername = profile.username
    user.githubId = profile.id
    user.githubAccessToken = profile.accessToken
    user.avatar = profile._json.avatar_url
    user.email = email

    Object.assign(ctx.query, { user: user })

    return next()
  },
  create: async (ctx, next) => {
    let profile = ctx.session.profile
    if (!profile) return ctx.redirect('/signin')

    let isnew = ctx.request.body.isnew
    let email = profile.emails && profile.emails[0] && profile.emails[0].value

    ctx.session.profile = null

    if (isnew) {
      if (!email || email === '' || await User.getByMail(email)) return ctx.renderError({}, 500, 'sign/no_github_email')
      if (await User.getByLoginName(profile.username)) return ctx.send('您 GitHub 账号的用户名与之前在 CNodejs 注册的用户名重复了', 500)

      profile.email = email
      Object.assign(ctx.query, { isnew: isnew, profile: profile })
    } else {
      let loginname = validator.trim(ctx.request.body.name || '').toLowerCase()
      let pass = validator.trim(ctx.request.body.pass || '')
      let user = await User.getByLoginName(loginname)
      if (!user || !(await tools.bcompare(pass, user.pass))) return ctx.renderError({ error: '账号名或密码错误。' }, 403, 'sign/signin')
      // in case
      // 账号1: 普通注册，邮箱为xxx@qq.com
      // 账号2: 普通注册，邮箱为xxx1@qq.com
      // 账号3: github注册，邮箱为xxx1@qq.com并与账号1关联的情况
      if (!email || email === '' || (user.email !== email && await User.getByMail(email))) return ctx.renderError({}, 500, 'sign/no_github_email')

      user.githubUsername = profile.username
      user.githubId = profile.id
      user.avatar = profile._json.avatar_url
      user.githubAccessToken = profile.accessToken
      user.email = email

      Object.assign(ctx.query, { isnew: isnew, user: user })
    }

    return next()
  }
}
