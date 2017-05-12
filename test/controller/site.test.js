'use strict'

const assert = require('power-assert')
const { request, config, helper } = require('../support.js')

describe('test/controller/site.test.js', function () {
  describe('GET / app/controller/site.index', function () {
    it('200', function () {
      return request
        .get('/')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, config.site.description))
        })
    })

    it('200 ?page=-1', function () {
      return request
        .get('/?page=-1')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, config.site.description))
        })
    })
  })

  describe('GET /sitemap.xml app/controller/site.sitemap', function () {
    it('200', function () {
      return request
        .get('/sitemap.xml')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'http://www.sitemaps.org/schemas/sitemap/0.9'))
        })
    })
  })

  describe('GET /app/download app/controller/site.appDownload', function () {
    it('200', function () {
      return request
        .get('/app/download')
        .expect(302)
    })
  })
})
