'use strict'

const { request, helper } = require('../support.js')
const assert = require('power-assert')

describe('test/controller/static.test.js', function () {
  describe('GET /about app/controller/static.about', function () {
    it('200', function () {
      return request
        .get('/about')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'CNode 社区由一批热爱 Node.js 技术的工程师发起'))
        })
    })
  })

  describe('GET /faq app/controller/static.faq', function () {
    it('200', function () {
      return request
        .get('/faq')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'CNode 社区和 Node Club 是什么关系？'))
        })
    })
  })

  describe('GET /getstart app/controller/sttatic.getstart', function () {
    it('200', function () {
      return request
        .get('/getstart')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'Node.js 新手入门'))
        })
    })
  })

  describe('GET /robots.txt app/controller/static.robots', function () {
    it('200', function () {
      return request
        .get('/robots.txt')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'User-Agent: *'))
        })
    })
  })

  describe('GET /api app/controller/static.api', function () {
    it('200', function () {
      return request
        .get('/api')
        .expect(200)
    })
  })
})
