'use strict'

const { helper, request } = require('../support.js')
const assert = require('power-assert')
const Promise = require('bluebird')

describe('test/controller/topic.test.js', function () {
  let user, topic

  before(async function () {
    [user, topic] = await Promise.all([
      helper.createUser(),
      helper.createTopic({}, true)
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
        .send(Object.assign({}, topic, {title: ''}))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '标题不能是空的。'))
        })
    })

    it('422: title is too long or short', function () {
      return request
        .post('/topic/create')
        .set('Cookie', user.cookie)
        .send(Object.assign({}, topic, {title: 'x'}))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '标题字数太多或太少。'))
        })
    })

    it('422: tab not specify', function () {
      return request
        .post('/topic/create')
        .set('Cookie', user.cookie)
        .send(Object.assign({}, topic, {tab: ''}))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '必须选择一个版块。'))
        })
    })

    it('422: t_content is empty', function () {
      return request
        .post('/topic/create')
        .set('Cookie', user.cookie)
        .send(Object.assign({}, topic, {t_content: ''}))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '内容不可为空'))
        })
    })
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
