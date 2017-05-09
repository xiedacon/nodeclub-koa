'use strict'

module.exports = {
  index: (ctx) => {
    return ctx.redirect(`https://www.google.com.hk/#hl=zh-CN&q=site:cnodejs.org+${encodeURIComponent(ctx.query.q)}`)
  }
}
