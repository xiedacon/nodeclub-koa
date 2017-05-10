'use strict'

const { User } = require('../service')
const auth = require('../middleware/auth.js')

module.exports = {
  callback: async (ctx) => {
    let user = ctx.query.user

    await User.update(
      { _id: user._id },
      {
        githubUsername: user.githubUsername,
        githubId: user.githubId,
        githubAccessToken: user.githubAccessToken,
        avatar: user.avatar,
        email: user.email
      }
    )

    auth.gen_session(user._id.toString(), ctx)
    return ctx.redirect('/')
  },
  new: (ctx) => {
    return ctx.render('sign/new_oauth', { actionPath: '/auth/github/create' })
  },
  create: async (ctx) => {
    let isnew = ctx.query.isnew

    if (isnew) {
      let profile = ctx.query.profile
      let user = await User.newAndSave({
        loginname: profile.username,
        pass: profile.accessToken,
        email: profile.email,
        avatar: profile._json.avatar_url,
        githubId: profile.id,
        githubUsername: profile.username,
        githubAccessToken: profile.accessToken,
        active: true
      })

      auth.gen_session(user._id.toString(), ctx)
      return ctx.redirect('/')
    } else {
      let user = ctx.query.user
      await User.update(
        { _id: user._id },
        {
          githubUsername: user.githubUsername,
          githubId: user.githubId,
          avatar: user.avatar,
          githubAccessToken: user.accessToken,
          email: user.email
        }
      )
      auth.gen_session(user._id.toString(), ctx)
      return ctx.redirect('/')
    }
  }
}
