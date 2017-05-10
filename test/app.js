'use strict'

const assert = require('power-assert')
const app = require('../app.js')
const request = require('supertest')(app.listen())
const { site: { description } } = require('../config/default.js')

describe('test/app.js', function () {
  it('/ status 200', function () {
    return request
      .get('/')
      .expect(200)
      .expect((res) => {
        assert(res.text.includes(description))
      })
  })
})
