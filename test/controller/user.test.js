'use strict'

const { request, helper } = require('../support.js')
const assert = require('power-assert')

describe('test/controller/user.test.js', function () {
  let user, name

  before(async function () {
    user = await helper.createUser()
    name = user.name
  })

  describe('GET /user/:name', function () {
    it('200: success', function () {
      return request
        .get('/user/' + name)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            `@${name} 的个人主页`,
            '注册时间',
            '这家伙很懒，什么个性签名都没有留下。',
            '最近创建的话题',
            '无话题',
            '最近参与的话题',
            '无话题'
          ]))
        })
    })

    it('404: with wrong name', function () {
      return request
        .get('/user/@aaa')
        .expect(404)
        .expect((res) => {
          assert(helper.includes(res.text, '这个用户不存在。'))
        })
    })
  })

  describe('GET /user/:name/topics', function () {
    it('200: success', function () {
      return request
        .get('/user/' + name + '/topics')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            `${name}的主页`,
            `${name} 创建的话题`,
            '这家伙很懒，什么个性签名都没有留下。'
          ]))
        })
    })

    it('404: with wrong name', function () {
      return request
        .get('/user/@aaa/topics')
        .expect(404)
        .expect((res) => {
          assert(helper.includes(res.text, '这个用户不存在。'))
        })
    })
  })

  describe('GET /user/:name/replies', function () {
    it('200: success', function () {
      return request
        .get('/user/' + name + '/replies')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            `${name}的主页`,
            `${name} 参与的话题`,
            '这家伙很懒，什么个性签名都没有留下。'
          ]))
        })
    })

    it('404: with wrong name', function () {
      return request
        .get('/user/@aaa/replies')
        .expect(404)
        .expect((res) => {
          assert(helper.includes(res.text, '这个用户不存在。'))
        })
    })
  })

  describe('GET /setting', function () {

  })

  describe('POST /setting', function () {

  })

  describe('GET /stars', function () {

  })

  describe('GET /users/top100', function () {

  })

  describe('GET /user/:name/collections', function () {

  })

  describe('POST /user/set_star', function () {

  })

  describe('POST /user/cancel_star', function () {

  })

  describe('POST /user/:name/block', function () {

  })

  describe('POST /user/:name/delete_all', function () {

  })
})
