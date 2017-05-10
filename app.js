'use strict'
global.Promise = require('bluebird')

const logger = require('./app/middleware/logger.js')
require('./app/middleware/redis.js')
require('./app/middleware/db.js')

require('colors')

const Koa = require('koa')
const config = require('config-lite')
const router = require('./app/router.js')
const apiRouter = require('./app/api_router.js')
const session = require('koa-session2')
const RedisStore = require('./app/middleware/redis_store.js')
const render = require('./app/middleware/render.js')
const staticMiddle = require('./app/middleware/static/static.js')
const less = require('less')
const mount = require('koa-mount')
const bodyparser = require('koa-bodyparser')
const auth = require('./app/middleware/auth.js')
const requestLog = require('./app/middleware/request_log.js')
const busboy = require('./app/middleware/busboy.js')
const bytes = require('bytes')
const helmet = require('koa-helmet')
const CSRF = require('koa-csrf')
const passport = require('koa-passport')
const GitHubStrategy = require('passport-github').Strategy

const app = new Koa()

app.use(require('./app/middleware/error_page.js'))
app.use(require('./app/middleware/send.js'))

// error handler
if ((!config.debug)) {
  app.use((ctx, next) => {
    try {
      return next()
    } catch (e) {
      logger.error(e)
      return ctx.send('500 status', 500)
    }
  })
}

app.use(mount('/public', staticMiddle(config.staticPath, {
  compress: true,
  extensions: {
    less: (data, ctx) => {
      return new Promise((resolve, reject) => {
        less.render(data, (e, output) => {
          if (e) throw reject(e)
          ctx.set('Content-Type', 'text/css; charset=utf-8')
          ctx.set('Content-Length', Buffer.byteLength(output.css))
          ctx.body = output.css
          resolve()
        })
      })
    }
  }
})))

// Request logger。请求时间
app.use(requestLog)

app.keys = [config.cookie.name]
app.use(helmet({ frameguard: { action: 'sameorigin' } }))
app.use(bodyparser())
app.use(session({
  key: config.session.secret,
  store: new RedisStore()
}))

// oauth 中间件
app.use(passport.initialize())

// github oauth
passport.serializeUser((user, done) => { done(null, user) })
passport.deserializeUser((user, done) => { done(null, user) })
passport.use(new GitHubStrategy(config.oauth.github, require('./app/middleware/github_strategy.js')))

// crsf
if (config.debug) {
  app.use((ctx, next) => {
    if (ctx.path === '/api' || ctx.path.indexOf('/api') < 0) {
      return (new CSRF())(ctx, () => {
        ctx.state.csrf = ctx.csrf
        return next()
      })
    }
    return next()
  })
}

app.use(busboy({
  limits: {
    fileSize: bytes(config.upload.file_limit)
  }
}))
app.use(render(
  require('./app/middleware/template.js'),
  require('./app/middleware/render_config.js')
))
if (config.debug) app.use(require('./app/middleware/render_log.js'))

// custom middleware
app.use(auth.authUser)
app.use(auth.blockUser)

app.use(router.routes())
app.use(router.allowedMethods())
app.use(apiRouter.routes())
app.use(apiRouter.allowedMethods())

app.listen(config.port, () => {
  logger.info('NodeClub listening on port', config.port)
  logger.info('God bless love....')
  logger.info(`You can debug your app with http://${config.host}:${config.port}`)
  logger.info('')
})

module.exports = app
