'use strict'

const { helper, request } = require('../support.js')
const assert = require('power-assert')

describe('test/controller/topic.test.js', function () {
  let user

  before(async function () {
    user = await helper.createUser()
  })

  describe('GET /topic/create', function () {
    it('200: success', function () {
      return request
        .get('/topic/create')
        .set('Cookie', user.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            '发布话题',
            '选择版块：'
          ]))
        })
    })

    it('403: without cookie', function () {
      return request
        .get('/topic/create')
        .expect(403)
    })
  })

  describe('POST /topic/create', function () {

  })

  describe('GET /topic/:tid', function () {

  })

  describe('GET /topic/:tid/edit', function () {

  })

  describe('POST /topic/:tid/edit', function () {

  })

  describe('POST /topic/:tid/delete', function () {

  })

  describe('POST /topic/collect', function () {

  })

  describe('POST /topic/de_collect', function () {

  })

  describe('POST /upload', function () {

  })

  describe('POST /topic/:tid/top', function () {

  })

  describe('POST /topic/:tid/good', function () {

  })

  describe('POST /topic/:tid/lock', function () {

  })
})
