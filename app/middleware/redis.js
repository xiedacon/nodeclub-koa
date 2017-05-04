'use strict'
const redis = require('redis')
const config = require('config-lite').redis
const logger = require('./logger.js')

Promise.promisifyAll(redis.RedisClient.prototype)

let client = redis.createClient(config)

client.on('error', (err) => {
  if (err) {
    logger.error('connect to redis error, check your redis config', err)
    process.exit(1)
  }
})

module.exports = client
