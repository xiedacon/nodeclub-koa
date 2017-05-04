'use strict'
const log4js = require('log4js')
const { debug, logger: config } = require('config-lite')

log4js.configure(config)

let logger = log4js.getLogger('cheese')
logger.setLevel(debug ? 'DEBUG' : 'ERROR')

module.exports = logger
