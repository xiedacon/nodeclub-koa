'use strict'

process.env.NODE_ENV = 'test'

const app = require('../app.js')
const request = require('supertest')(app.listen())

module.exports = {
  request: request,
  config: require('config-lite'),
  helper: require('./helper.js')
}
