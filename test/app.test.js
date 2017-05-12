'use strict'

const assert = require('power-assert')
const { request, config, helper } = require('./support.js')

describe('test/app.test.js', function () {
  describe('GET /', function () {
    it('200', function () {
      return request
        .get('/')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, config.site.description))
        })
    })
  })
})
