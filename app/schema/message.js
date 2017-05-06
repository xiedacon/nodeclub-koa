'use strict'

const helper = require('./helper.js')

module.exports = {
  index: (ctx, next) => {
    if (!helper.userRequired(ctx)) return

    return next()
  }
}
