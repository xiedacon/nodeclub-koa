'use strict'
const moment = require('moment')
const cache = require('../middleware/cache.js')
const { Types: { ObjectId } } = require('mongoose')

const SEPARATOR = '^_^@T_T'

module.exports = {
  userRequired: (ctx) => {
    if (!ctx.session || !ctx.session.user || !ctx.session.user._id) {
      ctx.send('forbidden!', 403)
      return false
    }
    return true
  },
  peruserperday: makePerDayLimiter('peruserperday', function (ctx) {
    return ctx.session.user.loginname
  }),
  peripperday: makePerDayLimiter('peripperday', function (ctx) {
    let realIP = ctx.request.get('x-real-ip')
    if (!realIP) throw new Error('should provice `x-real-ip` header')

    return realIP
  }),
  isValid: ObjectId.isValid
}

function makePerDayLimiter (identityName, identityFn) {
  /*
  options.showJson = true 表示调用来自API并返回结构化数据；否则表示调用来自前段并渲染错误页面
  */
  return async (ctx, name, limitCount, options) => {
    let identity = identityFn(ctx)
    let YYYYMMDD = moment().format('YYYYMMDD')
    let key = YYYYMMDD + SEPARATOR + identityName + SEPARATOR + name + SEPARATOR + identity

    let count = await cache.get(key) || 0

    if (count < limitCount) {
      count++
      await cache.set(key, count, 60 * 60 * 24)
      ctx.response.set('X-RateLimit-Limit', limitCount)
      ctx.response.set('X-RateLimit-Remaining', limitCount - count)
      return true
    } else {
      if (options.showJson) {
        ctx.send(JSON.stringify({
          success: false,
          error_msg: `频率限制：当前操作每天可以进行 ${limitCount} 次`
        }))
      } else {
        ctx.renderError(`频率限制：当前操作每天可以进行 ${limitCount} 次`, 403)
      }
      return false
    }
  }
}
