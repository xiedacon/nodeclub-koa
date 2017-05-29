'use strict'

const { request, helper } = require('../support.js')
const assert = require('power-assert')

describe('test/controller/github.test.js', function () {
  describe('GET /auth/github/new', function () {
    it('200: success', function () {
      return request
        .get('/auth/github/new')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            '注册新账号',
            '通过 GitHub 帐号',
            '关联旧账号'
          ]))
        })
    })
  })

  describe('POST /auth/github/create', function () {

  })
})
