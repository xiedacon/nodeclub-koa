'use strict'

const { helper, request } = require('../support.js')
const Promise = require('bluebird')
const assert = require('power-assert')

describe('test/controller/reply.test.js', function () {
  let user, reply, lockedTopicId, dbReply, deletedReply, otherUser, admin

  before(async function () {
    user = await helper.createUser();

    [reply, { _id: lockedTopicId }, dbReply, deletedReply, otherUser, admin] = await Promise.all([
      helper.createReply({ authorId: user._id }, true),
      helper.createTopic({ lock: true }),
      helper.createReply({ authorId: user._id }),
      helper.createReply({ authorId: user._id, deleted: true }),
      helper.createUser(),
      helper.createAdmin()
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
    it('200: success', function () {
      return request
        .get('/reply/' + dbReply._id + '/edit')
        .set('Cookie', user.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            '编辑回复',
            dbReply.content
          ]))
        })
    })

    it('403: without cookie', function () {
      return request
        .get('/reply/' + dbReply._id + '/edit')
        .expect(403)
    })

    it('422: reply not exist', function () {
      return Promise.all([
        request
          .get('/reply/aaa/edit')
          .set('Cookie', user.cookie)
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, '此回复不存在或已被删除。'))
          }),
        request
          .get('/reply/' + deletedReply._id + '/edit')
          .set('Cookie', user.cookie)
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, '此回复不存在或已被删除。'))
          })
      ])
    })

    it('403: user not author', function () {
      return request
        .get('/reply/' + dbReply._id + '/edit')
        .set('Cookie', otherUser.cookie)
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '对不起，你不能编辑此回复。'))
        })
    })

    it('200: user is admin', function () {
      return request
        .get('/reply/' + dbReply._id + '/edit')
        .set('Cookie', admin.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            '编辑回复',
            dbReply.content
          ]))
        })
    })
  })

  describe('POST /reply/:reply_id/edit', function () {

  })

  describe('POST /reply/:reply_id/delete', function () {

  })

  describe('POST /reply/:reply_id/up', function () {

  })
})
