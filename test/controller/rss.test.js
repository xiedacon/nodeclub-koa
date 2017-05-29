'use strict'

const { config, helper, request } = require('../support.js')
const assert = require('power-assert')

describe('test/controller/rss.test.js', function () {
  describe('GET /rss', function () {
    it('200: success', function () {
      return request
        .get('/rss')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            config.rss.title,
            config.rss.link,
            config.rss.language,
            config.rss.description
          ]))
        })
    })
  })
})
