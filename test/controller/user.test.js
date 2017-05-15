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
    let cookies
    before(function () {
      return request
        .post('/signin')
        .send({
          name: user.loginname,
          pass: user.pass
        })
        .expect((res) => {
          cookies = res.headers['set-cookie'].reduce((str, cookie) => {
            return str + cookie.split(';')[0] + ';'
          }, '')
        })
    })

    it('200: success', function () {
      return request
        .get('/setting')
        .set('Cookie', cookies)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            user.name,
            user.email,
            '保存设置',
            'Access Token',
            '积分: 0'
          ]))
        })
    })

    it('200: success with message', function () {
      return request
        .get('/setting')
        .query({ save: 'success' })
        .set('Cookie', cookies)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, [
            user.name,
            user.email,
            '保存设置',
            'Access Token',
            '保存成功。'
          ]))
        })
    })

    it('403: without cookie', function () {
      return request
        .get('/setting')
        .expect(403)
    })
  })

  describe('POST /setting', function () {
    let cookies
    before(function () {
      return request
        .post('/signin')
        .send({
          name: user.loginname,
          pass: user.pass
        })
        .expect((res) => {
          cookies = res.headers['set-cookie'].reduce((str, cookie) => {
            return str + cookie.split(';')[0] + ';'
          }, '')
        })
    })

    it('302: success action === "change_setting"', function () {
      return request
        .post('/setting')
        .set('Cookie', cookies)
        .send({
          action: 'change_setting',
          url: 'http://fxck.it',
          location: 'west lake',
          weibo: 'http://weibo.com/tangzhanli',
          github: '@alsotang',
          signature: '仍然很懒',
          name: user.loginname,
          email: user.email
        })
        .expect(302)
        .expect((res) => {
          assert(helper.includes(res.text, 'Redirecting to <a href="/setting?save=success">/setting?save=success</a>'))
        })
    })

    it('200: success action === "change_password"', function () {
      return request
        .post('/setting')
        .set('Cookie', cookies)
        .send({
          action: 'change_password',
          old_pass: user.pass,
          new_pass: user.pass
        })
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '密码已被修改。'))
        })
    })

    it('422: no old_pass or new_pass', function () {
      return request
        .post('/setting')
        .set('Cookie', cookies)
        .send({
          action: 'change_password',
          new_pass: user.pass
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '旧密码或新密码不得为空'))
        })
    })

    it('422: old_pass is wrong', function () {
      return request
        .post('/setting')
        .set('Cookie', cookies)
        .send({
          action: 'change_password',
          old_pass: user.pass + '1',
          new_pass: user.pass
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '当前密码不正确。'))
        })
    })

    it('422: action not support', function () {
      return request
        .post('/setting')
        .set('Cookie', cookies)
        .send({
          action: 'aaa'
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '不支持的action类型'))
        })
    })
  })

  describe('GET /stars', function () {
    it('200: success', function () {
      return request
        .get('/stars')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '社区达人'))
        })
    })
  })

  describe('GET /users/top100', function () {
    it('200: success', function () {
      return request
        .get('/users/top100')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'Top100 积分榜'))
        })
    })
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
