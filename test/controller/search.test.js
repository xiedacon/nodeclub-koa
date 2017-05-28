'use strict'

const { helper, request } = require('../support.js')
const assert = require('power-assert')

describe('test/controller/search.test.js', function () {
  describe('GET /search', function () {
    it('302: success', function () {
      return request
        .get('/search?q=aaa')
        .expect(302)
        .expect((res) => {
          assert(helper.includes(res.text, 'https://www.google.com.hk/#hl=zh-CN&amp;q=site:cnodejs.org+aaa'))
        })
    })
  })
})
