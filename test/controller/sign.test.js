'use strict'

const { request, helper, config, tools, User } = require('../support.js')
const assert = require('power-assert')
const Promise = require('bluebird')

describe('test/controller/sign.test.js', function () {
  let user, unactivedUser, activedUser

  before(async function () {
    [user, unactivedUser, activedUser] = await Promise.all([
      helper.createUser({}, true),
      helper.createUser({ active: false }),
      helper.createUser()
    ])

    user.re_pass = user.pass
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
    it('302: success', function () {
      return request
        .post('/signout')
        .set('Cookie', activedUser.cookie)
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
          name: activedUser.loginname,
          pass: activedUser.pass
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
          name: activedUser.email,
          pass: activedUser.pass
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
          pass: unactivedUser.pass
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
          pass: unactivedUser.pass
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
          name: `@${unactivedUser.loginname}`,
          pass: unactivedUser.pass
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
          name: unactivedUser.loginname,
          pass: unactivedUser.pass + '1'
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
          name: unactivedUser.loginname,
          pass: unactivedUser.pass
        })
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, `此帐号还没有被激活，激活链接已发送到 ${unactivedUser.email} 邮箱，请查收。`))
        })
    })
  })

  describe('GET /active_account', function () {
    it('500: no such user', function () {
      return request
        .get('/active_account')
        .expect(500)
        .expect((res) => {
          assert(helper.includes(res.text, `[ACTIVE_ACCOUNT] no such user: `))
        })
    })

    it('422: user is active', function () {
      return request
        .get('/active_account')
        .query({
          key: tools.md5(activedUser.email + activedUser.pass_db + config.session.secret),
          name: activedUser.name
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
          name: unactivedUser.name
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
          key: tools.md5(unactivedUser.email + unactivedUser.pass_db + config.session.secret),
          name: unactivedUser.name
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
        .expect((res) => {
          assert(helper.includes(res.text, '找回密码'))
        })
    })
  })

  describe('POST /search_pass', function () {
    it('200: success', function () {
      return request
        .post('/search_pass')
        .send({ email: activedUser.email })
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。'))
        })
    })

    it('422: email is wrongful', function () {
      return request
        .post('/search_pass')
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '邮箱不合法'))
        })
    })

    it('422: email not in db', function () {
      return request
        .post('/search_pass')
        .send({ email: activedUser.email + 'm' })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '没有这个电子邮箱。'))
        })
    })
  })

  describe('GET /reset_pass', function () {
    let key = 'test'
    let time = Date.now()

    beforeEach(function () {
      return User.update({ loginname: activedUser.loginname }, { retrieve_key: key, retrieve_time: time })
    })

    it('200: success', async function () {
      return request
        .get('/reset_pass')
        .send({ key: key, name: activedUser.loginname })
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '重置密码'))
        })
    })

    it('403: name or key are wrongful', function () {
      return request
        .get('/reset_pass')
        .send({ key: key })
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '信息有误，密码无法重置。'))
        })
    })

    it('403: reset time more than one day', async function () {
      await User.update({ loginname: activedUser.loginname }, { retrieve_time: Date.now() - 1000 * 60 * 60 * 24 - 1 })

      return request
        .get('/reset_pass')
        .send({ key: key, name: activedUser.loginname })
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '该链接已过期，请重新申请。'))
        })
    })
  })

  describe('POST /reset_pass', function () {
    let key = 'test'
    let time = Date.now()

    beforeEach(function () {
      return User.update({ loginname: activedUser.loginname }, { retrieve_key: key, retrieve_time: time })
    })

    it('200: success', function () {
      return request
        .post('/reset_pass')
        .send({
          psw: activedUser.pass + '1',
          repsw: activedUser.pass + '1',
          key: key,
          name: activedUser.loginname
        })
        .expect(200)
        .expect((res) => {
          assert(helper.includes(res.text, '你的密码已重置。'))
        })
    })

    it('422: no pass', function () {
      return request
        .post('/reset_pass')
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '密码不能为空'))
        })
    })

    it('422: pass !== repass', function () {
      return request
        .post('/reset_pass')
        .send({
          psw: activedUser.pass + '1',
          repsw: activedUser.pass,
          key: key,
          name: activedUser.loginname
        })
        .expect(422)
        .expect((res) => {
          assert(helper.includes(res.text, '两次密码输入不一致。'))
        })
    })

    it('403: key or name are wrongful', function () {
      return request
        .post('/reset_pass')
        .send({
          psw: activedUser.pass + '1',
          repsw: activedUser.pass + '1',
          name: activedUser.loginname
        })
        .expect(403)
        .expect((res) => {
          assert(helper.includes(res.text, '错误的激活链接'))
        })
    })

    afterEach(function () {
      return User.update({ loginname: activedUser.loginname }, { pass: activedUser.pass })
    })
  })
})
