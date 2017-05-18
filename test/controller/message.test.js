'use strict'

const { helper, request } = require('../support.js')
const assert = require('power-assert')

describe('test/controller/message.test.js', function () {
  let user

  before(async function () {
    user = await helper.createUser()
  })

  describe('GET /my/messages', function () {
    it('200: success', function () {
      return request
        .get('/my/messages')
        .set('Cookie', user.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            '新消息',
            '无消息',
            '过往信息'
          ]))
        })
    })

    it('403: without session', function () {
      return request
        .get('/my/messages')
        .expect(403)
    })
  })
})
