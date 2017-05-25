'use strict'

const { helper, request, config } = require('../support.js')
const assert = require('power-assert')
const Promise = require('bluebird')

describe('test/controller/topic.test.js', function () {
  let user, topic, dbTopic, deletedTopic, withoutAuthorTopic, admin, otherUser, dbTopic1, dbTopic2

  before(async function () {
    user = await helper.createUser();

    [topic, dbTopic, deletedTopic, withoutAuthorTopic, admin, otherUser, dbTopic1, dbTopic2] = await Promise.all([
      helper.createTopic({}, true),
      helper.createTopic({ authorId: user._id }),
      helper.createTopic({ authorId: user._id, deleted: true }),
      helper.createTopic({ authorId: 'aaaaaaaaaaaaaaaaaaaaaaaa' }),
      helper.createAdmin(),
      helper.createUser(),
      helper.createTopic({ authorId: user._id }),
      helper.createTopic({ authorId: user._id })
    ])

    topic.t_content = topic.content
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
    it('302: success', function () {
      return request
        .post('/topic/create')
        .set('Cookie', user.cookie)
        .send(topic)
        .expect(302)
        .expect((res) => {
          assert(helper.includes(res.text, '/topic/'))
        })
    })

    it('403: without user cookie', function () {
      return request
        .post('/topic/create')
        .send(topic)
        .expect(403)
    })

    it('422: title is empty', function () {
      return request
        .post('/topic/create')
        .set('Cookie', user.cookie)
        .send(Object.assign({}, topic, { title: '' }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '标题不能是空的。'))
        })
    })

    it('422: title is too long or short', function () {
      return request
        .post('/topic/create')
        .set('Cookie', user.cookie)
        .send(Object.assign({}, topic, { title: 'x' }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '标题字数太多或太少。'))
        })
    })

    it('422: tab not specify', function () {
      return request
        .post('/topic/create')
        .set('Cookie', user.cookie)
        .send(Object.assign({}, topic, { tab: '' }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '必须选择一个版块。'))
        })
    })

    it('422: t_content is empty', function () {
      return request
        .post('/topic/create')
        .set('Cookie', user.cookie)
        .send(Object.assign({}, topic, { t_content: '' }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '内容不可为空'))
        })
    })
  })

  describe('GET /topic/:tid', function () {
    it('200: success', function () {
      return request
        .get('/topic/' + dbTopic._id)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            dbTopic.title,
            config.site.tabs.find((pair) => { return pair[0] === dbTopic.tab })[1],
            dbTopic.content,
            user.name
          ]))
        })
    })

    it('404: topic not exist', function () {
      return Promise.all([
        request
          .get('/topic/aaa' + dbTopic._id)
          .expect(404)
          .expect((res) => {
            assert(helper.includes(res.text, '此话题不存在或已被删除。'))
          }),
        request
          .get('/topic/' + deletedTopic._id)
          .expect(404)
          .expect((res) => {
            assert(helper.includes(res.text, '此话题不存在或已被删除。'))
          })
      ])
    })

    it('404: topic without author', function () {
      return request
        .get('/topic/' + withoutAuthorTopic._id)
        .expect(404)
        .expect((res) => {
          assert(helper.includes(res.text, '话题的作者丢了。'))
        })
    })
  })

  describe('GET /topic/:tid/edit', function () {
    it('200: success', function () {
      return request
        .get('/topic/' + dbTopic._id + '/edit')
        .set('Cookie', user.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            '编辑话题',
            dbTopic.title,
            dbTopic.content,
            dbTopic.tab
          ]))
        })
    })

    it('200: user is admin', function () {
      return request
        .get('/topic/' + dbTopic._id + '/edit')
        .set('Cookie', admin.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            '编辑话题',
            dbTopic.title,
            dbTopic.content,
            dbTopic.tab
          ]))
        })
    })

    it('403: without cookie', function () {
      return request
        .get('/topic/' + dbTopic._id + '/edit')
        .expect(403)
    })

    it('404: topic not exist', function () {
      return Promise.all([
        request
          .get('/topic/aaa' + dbTopic._id + '/edit')
          .set('Cookie', user.cookie)
          .expect(404)
          .expect((res) => {
            assert(helper.includes(res.text, '此话题不存在或已被删除。'))
          }),
        request
          .get('/topic/' + deletedTopic._id + '/edit')
          .set('Cookie', user.cookie)
          .expect(404)
          .expect((res) => {
            assert(helper.includes(res.text, '此话题不存在或已被删除。'))
          })
      ])
    })

    it('403: user not author', function () {
      return request
        .get('/topic/' + dbTopic._id + '/edit')
        .set('Cookie', otherUser.cookie)
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '对不起，你不能编辑此话题。'))
        })
    })
  })

  describe('POST /topic/:tid/edit', function () {
    it('302: success', function () {
      return request
        .post('/topic/' + dbTopic._id + '/edit')
        .set('Cookie', user.cookie)
        .send({
          title: dbTopic.title,
          tab: dbTopic.tab,
          t_content: dbTopic.content
        })
        .expect(302)
        .expect((res) => {
          assert(helper.includes(res.text, `/topic/${dbTopic._id}`))
        })
    })

    it('403: without cookie', function () {
      return request
        .post('/topic/' + dbTopic._id + '/edit')
        .send({
          title: dbTopic.title,
          tab: dbTopic.tab,
          t_content: dbTopic.content
        })
        .expect(403)
    })

    it('404: topic not exist', function () {
      return Promise.all([
        request
          .post('/topic/aaa' + dbTopic._id + '/edit')
          .set('Cookie', user.cookie)
          .send({
            title: dbTopic.title,
            tab: dbTopic.tab,
            t_content: dbTopic.content
          })
          .expect(404)
          .expect((res) => {
            assert(helper.includes(res.text, '此话题不存在或已被删除。'))
          }),
        request
          .post('/topic/' + deletedTopic._id + '/edit')
          .set('Cookie', user.cookie)
          .send({
            title: dbTopic.title,
            tab: dbTopic.tab,
            t_content: dbTopic.content
          })
          .expect(404)
          .expect((res) => {
            assert(helper.includes(res.text, '此话题不存在或已被删除。'))
          })
      ])
    })

    it('422: title is empty', function () {
      return request
        .post('/topic/' + dbTopic._id + '/edit')
        .set('Cookie', user.cookie)
        .send({
          title: '',
          tab: dbTopic.tab,
          t_content: dbTopic.content
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '标题不能是空的。'))
        })
    })

    it('422: title is too long or short', function () {
      return request
        .post('/topic/' + dbTopic._id + '/edit')
        .set('Cookie', user.cookie)
        .send({
          title: 'x',
          tab: dbTopic.tab,
          t_content: dbTopic.content
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '标题字数太多或太少。'))
        })
    })

    it('422: tab not specify', function () {
      return request
        .post('/topic/' + dbTopic._id + '/edit')
        .set('Cookie', user.cookie)
        .send({
          title: dbTopic.title,
          tab: '',
          t_content: dbTopic.content
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '必须选择一个版块。'))
        })
    })

    it('422: t_content is empty', function () {
      return request
        .post('/topic/' + dbTopic._id + '/edit')
        .set('Cookie', user.cookie)
        .send({
          title: dbTopic.title,
          tab: dbTopic.tab,
          t_content: ''
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '内容不可为空'))
        })
    })

    it('403: user not author', function () {
      return request
        .post('/topic/' + dbTopic._id + '/edit')
        .set('Cookie', otherUser.cookie)
        .send({
          title: dbTopic.title,
          tab: dbTopic.tab,
          t_content: dbTopic.content
        })
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '对不起，你不能编辑此话题。'))
        })
    })

    it('302: user is admin', function () {
      return request
        .post('/topic/' + dbTopic._id + '/edit')
        .set('Cookie', admin.cookie)
        .send({
          title: dbTopic.title,
          tab: dbTopic.tab,
          t_content: dbTopic.content
        })
        .expect(302)
        .expect((res) => {
          assert(helper.includes(res.text, `/topic/${dbTopic._id}`))
        })
    })
  })

  describe('POST /topic/:tid/delete', function () {
    it('403: without cookie', function () {
      return request
        .post('/topic/' + dbTopic1._id + '/delete')
        .expect(403)
    })

    it('404: topic not exist', function () {
      return Promise.all([
        request
          .post('/topic/aaa' + dbTopic1._id + '/delete')
          .set('Cookie', user.cookie)
          .expect(404)
          .expect((res) => {
            assert(helper.includes(res.text, '此话题不存在或已被删除。'))
          }),
        request
          .post('/topic/' + deletedTopic._id + '/delete')
          .set('Cookie', user.cookie)
          .expect(404)
          .expect((res) => {
            assert(helper.includes(res.text, '此话题不存在或已被删除。'))
          })
      ])
    })

    it('403: user not author', function () {
      return request
        .post('/topic/' + dbTopic1._id + '/delete')
        .set('Cookie', otherUser.cookie)
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '无权限'))
        })
    })

    it('200: success', function () {
      return request
        .post('/topic/' + dbTopic1._id + '/delete')
        .set('Cookie', user.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '话题已被删除。'))
        })
    })

    it('200: user is admin', function () {
      return request
        .post('/topic/' + dbTopic2._id + '/delete')
        .set('Cookie', admin.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '话题已被删除。'))
        })
    })
  })

  describe('POST /topic/collect', function () {
    it('200: success', function () {
      return request
        .post('/topic/collect')
        .set('Cookie', user.cookie)
        .send({ topic_id: dbTopic._id })
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'success'))
        })
    })

    it('403: without cookie', function () {
      return request
        .post('/topic/collect')
        .send({ topic_id: dbTopic._id })
        .expect(403)
    })

    it('422: topic not exist or collected', function () {
      return Promise.all([
        request
          .post('/topic/collect')
          .set('Cookie', user.cookie)
          .send({ topic_id: 'aaaaaaaaaaaaaaaaaaaaaaaa' })
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, 'failed'))
          }),
        request
          .post('/topic/collect')
          .set('Cookie', user.cookie)
          .send({ topic_id: dbTopic._id })
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, 'failed'))
          })
      ])
    })
  })

  describe('POST /topic/de_collect', function () {
    it('200: success', function () {
      return request
        .post('/topic/de_collect')
        .set('Cookie', user.cookie)
        .send({ topic_id: dbTopic._id })
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'success'))
        })
    })

    it('403: without cookie', function () {
      return request
        .post('/topic/de_collect')
        .send({ topic_id: dbTopic._id })
        .expect(403)
    })

    it('422: topic not exist or collected', function () {
      return Promise.all([
        request
          .post('/topic/de_collect')
          .set('Cookie', user.cookie)
          .send({ topic_id: 'aaaaaaaaaaaaaaaaaaaaaaaa' })
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, 'failed'))
          }),
        request
          .post('/topic/de_collect')
          .set('Cookie', user.cookie)
          .send({ topic_id: dbTopic._id })
          .expect(422)
          .expect((res) => {
            assert(helper.includes(res.text, 'failed'))
          })
      ])
    })
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
