'use strict'

const { helper, request } = require('../support.js')
const Promise = require('bluebird')
const assert = require('power-assert')

describe('test/controller/reply.test.js', function () {
  let user, reply, lockedTopicId

  before(async function () {
    user = await helper.createUser();

    [reply, { _id: lockedTopicId }] = await Promise.all([
      helper.createReply({ authorId: user._id }, true),
      helper.createTopic({ lock: true })
    ])
  })

  describe('POST /:topic_id/reply', function () {
    it('302: success', function () {
      return request
        .post('/' + reply.topicId + '/reply')
        .set('Cookie', user.cookie)
        .send({
          r_content: reply.content
        })
        .expect(302)
        .expect((res) => {
          assert(helper.includes(res.text, `/topic/${reply.topicId}#`))
        })
    })

    it('403: without cookie', function () {
      return request
        .post('/' + reply.topicId + '/reply')
        .send({
          r_content: reply.content
        })
        .expect(403)
    })

    it('422: content is empty', function () {
      return request
        .post('/' + reply.topicId + '/reply')
        .set('Cookie', user.cookie)
        .send({
          r_content: ''
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '回复内容不能为空!'))
        })
    })

    it('422: topic not exist', function () {
      return request
        .post('/aaaaaaaaaaaaaaaaaaaaaaaa/reply')
        .set('Cookie', user.cookie)
        .send({
          r_content: reply.content
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '此主题不存在。'))
        })
    })

    it('403: topic locked', function () {
      return request
        .post('/' + lockedTopicId + '/reply')
        .set('Cookie', user.cookie)
        .send({
          r_content: reply.content
        })
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '此主题已锁定。'))
        })
    })
  })

  describe('GET /reply/:reply_id/edit', function () {

  })

  describe('POST /reply/:reply_id/edit', function () {

  })

  describe('POST /reply/:reply_id/delete', function () {

  })

  describe('POST /reply/:reply_id/up', function () {

  })
})
