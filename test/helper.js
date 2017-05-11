'use strict'

process.env.NODE_ENV = 'test'

const app = require('../app.js')
const request = require('supertest')(app.listen())
const config = require('config-lite')

module.exports = {
  request: request,
  config: config
}
