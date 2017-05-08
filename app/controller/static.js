'use strict'

module.exports = {
  about: (ctx) => {
    return ctx.render('static/about', { pageTitle: '关于我们' })
  },
  faq: (ctx) => {
    return ctx.render('static/faq')
  },
  getstart: (ctx) => {
    return ctx.render('static/getstart', { pageTitle: 'Node.js 新手入门' })
  },
  robots: (ctx) => {
    ctx.response.type = 'text/plain'
    return ctx.send(
      `# See http://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file
#
# To ban all spiders from the entire site uncomment the next two lines:
# User-Agent: *
# Disallow: /`
    )
  },
  api: (ctx) => {
    return ctx.render('static/api')
  }
}
