'use strict'
const mongoose = require('mongoose')
const logger = require('./logger.js')
const {uri, options} = require('config-lite').db
const debug = require('config-lite').debug

mongoose.Promise = global.Promise

mongoose.connect(uri, options, (err) => {
  if (err) {
    logger.error('connect to %s error: ', uri, err.message)
    process.exit(1)
  }
})

if (debug) {
  mongoose.Mongoose.prototype.mquery.setGlobalTraceFunction((method, info, query) => {
    return (err, result, millis) => {
      if (err) logger.error('traceMQuery error:', err)

      let infos = []
      infos.push(`${query._collection.collection.name}.${method.blue}`)
      infos.push(JSON.stringify(info))
      infos.push(`${millis}ms`.green)

      logger.debug('MONGO'.magenta, infos.join(' '))
    }
  })
}

module.exports = mongoose
