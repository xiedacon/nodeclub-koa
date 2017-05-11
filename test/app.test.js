'use strict'

const assert = require('power-assert')
const { request, config } = require('./helper.js')

describe('test/app.test.js', function () {
  describe('GET /', function () {
    it('200', function () {
      return request
        .get('/')
        .expect(200)
        .expect((res) => {
          assert(res.text.includes(config.site.description))
        })
    })
  })
})
