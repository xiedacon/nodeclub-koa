'use strict'

const { helper, request } = require('../support.js')
const Promise = require('bluebird')
const assert = require('power-assert')

describe('test/controller/reply.test.js', function () {
  let user, reply, lockedTopicId, dbReply, deletedReply, otherUser, admin, dbReply1, dbReply2, otherReply

  before(async function () {
    user = await helper.createUser();

    [reply, { _id: lockedTopicId }, dbReply, deletedReply, otherUser, admin, dbReply1, dbReply2, otherReply] = await Promise.all([
      helper.createReply({ authorId: user._id }, true),
      helper.createTopic({ lock: true }),
      helper.createReply({ authorId: user._id }),
      helper.createReply({ authorId: user._id, deleted: true }),
      helper.createUser(),
      helper.createAdmin(),
      helper.createReply({ authorId: user._id }),
      helper.createReply({ authorId: user._id }),
      helper.createReply()
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
    it('302: success', function () {
      return request
        .post('/reply/' + dbReply._id + '/edit')
        .set('Cookie', user.cookie)
        .send({ t_content: dbReply.content })
        .expect(302)
        .expect((res) => {
          assert(helper.includes(res.text, `/topic/${dbReply.topic_id}#${dbReply._id}`))
        })
    })

    it('403: without cookie', function () {
      return request
        .post('/reply/' + dbReply._id + '/edit')
        .send({ t_content: dbReply.content })
        .expect(403)
    })

    it('422: reply not exist', function () {
      return Promise.all([
        request
          .post('/reply/aaa/edit')
          .set('Cookie', user.cookie)
          .send({ t_content: dbReply.content })
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, '此回复不存在或已被删除。'))
          }),
        request
          .post('/reply/' + deletedReply._id + '/edit')
          .set('Cookie', user.cookie)
          .send({ t_content: dbReply.content })
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, '此回复不存在或已被删除。'))
          })
      ])
    })

    it('403: user not author', function () {
      return request
        .post('/reply/' + dbReply._id + '/edit')
        .set('Cookie', otherUser.cookie)
        .send({ t_content: dbReply.content })
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '对不起，你不能编辑此回复。'))
        })
    })

    it('302: user is admin', function () {
      return request
        .post('/reply/' + dbReply._id + '/edit')
        .send({ t_content: dbReply.content })
        .set('Cookie', admin.cookie)
        .expect(302)
    })

    it('422: content is empty', function () {
      return request
        .post('/reply/' + dbReply._id + '/edit')
        .set('Cookie', admin.cookie)
        .send({ t_content: '' })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '回复的字数太少。'))
        })
    })
  })

  describe('POST /reply/:reply_id/delete', function () {
    it('200: success', function () {
      return request
        .post('/reply/' + dbReply1._id + '/delete')
        .set('Cookie', user.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'success'))
        })
    })

    it('403: without cookie', function () {
      return request
        .post('/reply/' + dbReply1._id + '/delete')
        .expect(403)
    })

    it('422: reply not exist', function () {
      return Promise.all([
        request
          .post('/reply/aaa/delete')
          .set('Cookie', user.cookie)
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, 'no reply aaa exists'))
          }),
        request
          .post('/reply/' + deletedReply._id + '/delete')
          .set('Cookie', user.cookie)
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, `no reply ${deletedReply._id} exists`))
          })
      ])
    })

    it('403: user not author', function () {
      return request
        .post('/reply/' + dbReply._id + '/delete')
        .set('Cookie', otherUser.cookie)
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, 'failed'))
        })
    })

    it('200: user is admin', function () {
      return request
        .post('/reply/' + dbReply2._id + '/delete')
        .set('Cookie', admin.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'success'))
        })
    })
  })

  describe('POST /reply/:reply_id/up', function () {
    it('200: success', function () {
      return request
        .post('/reply/' + otherReply._id + '/up')
        .set('Cookie', user.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, ['success', 'true']))
        })
    })

    it('403: without cookie', function () {
      return request
        .post('/reply/' + otherReply._id + '/up')
        .expect(403)
    })

    it('422: reply not exist', function () {
      return Promise.all([
        request
          .post('/reply/aaa/up')
          .set('Cookie', user.cookie)
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, '此回复不存在或已被删除。'))
          }),
        request
          .post('/reply/' + deletedReply._id + '/up')
          .set('Cookie', user.cookie)
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, '此回复不存在或已被删除。'))
          })
      ])
    })

    it('403: can not up oneself', function () {
      return request
        .post('/reply/' + dbReply._id + '/up')
        .set('Cookie', user.cookie)
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '呵呵，不能帮自己点赞。'))
        })
    })
  })
})
