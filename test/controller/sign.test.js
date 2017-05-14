'use strict'

const { request, helper, config, tools } = require('../support.js')
const assert = require('power-assert')
const Promise = require('bluebird')

describe('test/controller/sign.test.js', async function () {
  let t = Date.now()
  let key = (i = 0) => { return `${i}YYYYtest${t}` }

  let { user, user_reigsted, user_actived } = await Promise.props({
    user: {
      loginname: key(1),
      email: `${key(1)}@qq.com`,
      pass: 'test',
      re_pass: 'test'
    },
    user_reigsted: helper.createUser({
      loginname: key(2),
      email: `${key(2)}@qq.com`,
      pass: 'test'
    }),
    user_actived: helper.createUser({
      loginname: key(3),
      email: `${key(3)}@qq.com`,
      pass: 'test',
      active: true
    })
  })

  describe('GET /signup', function () {
    it('200', function () {
      return request
        .get('/signup')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '确认密码'))
        })
    })
  })

  describe('POST /signup', function () {
    it('200: signup new user', function () {
      return request
        .post('/signup')
        .send(user)
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '欢迎加入 Nodeclub！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'))
        })
    })

    it('422: loginname exist', function () {
      return request
        .post('/signup')
        .send(Object.assign({}, user, { email: `test${user.email}` }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '用户名或邮箱已被使用。'))
        })
    })

    it('422: email exist', function () {
      return request
        .post('/signup')
        .send(Object.assign({}, user, { loginname: `test${user.loginname}` }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '用户名或邮箱已被使用。'))
        })
    })

    it('422: without loginname', function () {
      return request
        .post('/signup')
        .send(Object.assign({}, user, { loginname: undefined }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '信息不完整。'))
        })
    })

    it('422: loginname.length < 5', function () {
      return request
        .post('/signup')
        .send(Object.assign({}, user, { loginname: 'test' }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '用户名至少需要5个字符。'))
        })
    })

    it('422: loginname is wrongful', function () {
      return request
        .post('/signup')
        .send(Object.assign({}, user, { loginname: `@${user.loginname}` }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '用户名不合法。'))
        })
    })

    it('422: email is wrongful', function () {
      return request
        .post('/signup')
        .send(Object.assign({}, user, { email: `@${user.email}` }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '邮箱不合法。'))
        })
    })

    it('422: pass !== re_pass', function () {
      return request
        .post('/signup')
        .send(Object.assign({}, user, { re_pass: 't' }))
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '两次密码输入不一致。'))
        })
    })
  })

  describe('POST /signout', function () {
    it('302: success', async function () {
      let cookies
      await request
        .post('/signin')
        .send({
          name: user_actived.loginname,
          pass: user_actived.pass
        })
        .expect((res) => {
          cookies = res.headers['set-cookie'].reduce((str, cookie) => {
            return str + cookie.split(';')[0] + ';'
          }, '')
        })

      return request
        .post('/signout')
        .set('Cookie', cookies)
        .expect(302)
        .expect((res) => {
          assert(helper.includes(res.text, 'Redirecting to', 'href', '/'))
        })
    })

    it('404: without session', function () {
      return request
        .post('/signout')
        .expect(404)
    })
  })

  describe('GET /signin', function () {
    it('200', function () {
      return request
        .get('/signin')
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '登录', '通过 GitHub 登录', '忘记密码了?'))
        })
    })
  })

  describe('POST /signin', function () {
    it('302: success', function () {
      return request
        .post('/signin')
        .send({
          name: user_actived.loginname,
          pass: user_actived.pass
        })
        .expect(302)
        .expect((res) => {
          assert(helper.includes(res.headers.location, '/'))
        })
    })

    it('302: success, loginname is email', function () {
      return request
        .post('/signin')
        .send({
          name: user_actived.email,
          pass: user_actived.pass
        })
        .expect(302)
        .expect((res) => {
          assert(helper.includes(res.headers.location, '/'))
        })
    })

    it('422: without loginname', function () {
      return request
        .post('/signin')
        .send({
          pass: user_reigsted.pass
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '信息不完整。'))
        })
    })

    it('422: loginname.length < 5', function () {
      return request
        .post('/signin')
        .send({
          name: `test`,
          pass: user_reigsted.pass
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '用户名至少需要5个字符。'))
        })
    })

    it('422: loginname is wrongful', function () {
      return request
        .post('/signin')
        .send({
          name: `@${user_reigsted.loginname}`,
          pass: user_reigsted.pass
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '用户名不合法。'))
        })
    })

    it('403: pass is wrong', function () {
      return request
        .post('/signin')
        .send({
          name: user_reigsted.loginname,
          pass: user_reigsted.pass + '1'
        })
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '用户名或密码错误'))
        })
    })

    it('403: user is not active', function () {
      return request
        .post('/signin')
        .send({
          name: user_reigsted.loginname,
          pass: user_reigsted.pass
        })
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, `此帐号还没有被激活，激活链接已发送到 ${user_reigsted.email} 邮箱，请查收。`))
        })
    })
  })

  describe('GET /active_account', function () {
    it('500: no such user', function () {
      return request
        .get('/active_account')
        .expect(500)
        .expect((res) => {
          assert(helper.includes(res.text, '500 status'))
        })
    })

    it('422: user is active', function () {
      return request
        .get('/active_account')
        .query({
          key: tools.md5(user_actived.email + user_actived.pass_db + config.session.secret),
          name: user_actived.name
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '帐号已经是激活状态。'))
        })
    })

    it('422: message error', function () {
      return request
        .get('/active_account')
        .query({
          key: '',
          name: user_reigsted.name
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '信息有误，帐号无法被激活。'))
        })
    })

    it('200: success', function () {
      return request
        .get('/active_account')
        .query({
          key: tools.md5(user_reigsted.email + user_reigsted.pass_db + config.session.secret),
          name: user_reigsted.name
        })
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '帐号已被激活，请登录'))
        })
    })
  })

  describe('GET /search_pass', function () {
    it('200', function () {
      return request
        .get('/search_pass')
        .expect(200)
    })
  })

  describe('POST /search_pass', function () {

  })

  describe('GET /reset_pass', function () {

  })

  describe('POST /reset_pass', function () {

  })
})
