'use strict'
global.Promise = require('bluebird')

const logger = require('./app/middleware/logger.js')
require('./app/middleware/redis.js')
require('./app/middleware/db.js')

require('colors')

const Koa = require('koa')
const config = require('config-lite')
const router = require('./app/router.js')
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

const app = new Koa()

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
app.use(bodyparser())
app.use(session({
  key: config.session.secret,
  store: new RedisStore()
}))

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

app.use(require('./app/middleware/error_page.js'))
app.use(require('./app/middleware/send.js'))

// custom middleware
app.use(auth.authUser)
app.use(auth.blockUser)

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(config.port, () => {
  logger.info('NodeClub listening on port', config.port)
  logger.info('God bless love....')
  logger.info('You can debug your app with http://' + config.host + ':' + config.port)
  logger.info('')
})
