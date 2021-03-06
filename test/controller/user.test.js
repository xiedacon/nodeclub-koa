'use strict'

const { request, helper } = require('../support.js')
const assert = require('power-assert')
const Promise = require('bluebird')

describe('test/controller/user.test.js', function () {
  let user, name, admin

  before(async function () {
    [user, admin] = await Promise.all([
      helper.createUser(),
      helper.createAdmin()
    ])

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
    it('200: success', function () {
      return request
        .get('/setting')
        .set('Cookie', user.cookie)
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
        .set('Cookie', user.cookie)
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
    it('302: success action === "change_setting"', function () {
      return request
        .post('/setting')
        .set('Cookie', user.cookie)
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
        .set('Cookie', user.cookie)
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
        .set('Cookie', user.cookie)
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
        .set('Cookie', user.cookie)
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
        .set('Cookie', user.cookie)
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
    it('200: success', function () {
      return request
        .get('/user/' + name + '/collections')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '收藏的话题'))
        })
    })

    it('404: user not exist', function () {
      return request
        .get('/user/@aaa/collections')
        .expect(404)
        .expect((res) => {
          assert(helper.includes(res.text, '这个用户不存在。'))
        })
    })
  })

  describe('POST /user/set_star | /user/cancel_star', function () {
    it('200: success', function () {
      return request
        .post('/user/set_star')
        .set('Cookie', admin.cookie)
        .send({ user_id: user._id })
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'success'))
        })
    })

    it('422: user not exist', function () {
      return request
        .post('/user/set_star')
        .set('Cookie', admin.cookie)
        .send({ user_id: '@aaa' })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, 'user is not exists'))
        })
    })

    it('403: not admin', function () {
      return request
        .post('/user/set_star')
        .send({ user_id: user._id })
        .expect(403)
    })
  })

  describe('POST /user/:name/block', function () {
    it('200: success action = set_block', async function () {
      await request
        .post('/user/' + name + '/block')
        .set('Cookie', admin.cookie)
        .send({ action: 'set_block' })
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'success'))
        })

      return request
        .post('/user/' + name + '/block')
        .set('Cookie', user.cookie)
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '您已被管理员屏蔽了。有疑问请联系'))
        })
    })

    it('200: success action = cancel_block', async function () {
      await request
        .post('/user/' + name + '/block')
        .set('Cookie', admin.cookie)
        .send({ action: 'cancel_block' })
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'success'))
        })

      return request
        .post('/user/' + name + '/block')
        .send({ action: 'cancel_block' })
        .expect(403)
    })

    it('403: not admin', function () {
      return request
        .post('/user/' + name + '/block')
        .send({ action: 'cancel_block' })
        .expect(403)
    })

    it('422: user not exist', function () {
      return request
        .post('/user/@aaa/block')
        .set('Cookie', admin.cookie)
        .send({ action: 'cancel_block' })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, 'user is not exists'))
        })
    })

    it('422: not support action', function () {
      return request
        .post('/user/' + name + '/block')
        .set('Cookie', admin.cookie)
        .send({ action: 'aaa' })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, 'not support action'))
        })
    })
  })

  describe('POST /user/:name/delete_all', function () {
    it('403: not admin', function () {
      return request
        .post('/user/' + name + '/delete_all')
        .expect(403)
    })

    it('422: user not exist', function () {
      return request
        .post('/user/@aaa/delete_all')
        .set('Cookie', admin.cookie)
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, 'user is not exists'))
        })
    })

    it('200: success', function () {
      return request
        .post('/user/' + name + '/delete_all')
        .set('Cookie', admin.cookie)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, 'success'))
        })
    })
  })
})
