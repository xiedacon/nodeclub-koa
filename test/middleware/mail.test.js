'use strict'

const rewire = require('rewire')
const mail = rewire('../../app/middleware/mail.js')
const assert = require('power-assert')
const { config } = require('../support.js')

describe('test/middleware/mail.test.js', function () {
  before(function () {
    process.env.NODE_ENV = 'production'
  })

  after(function () {
    process.env.NODE_ENV = 'test'
  })

  describe('#sendMail', function () {
    it('should success', async function () {
      let data = 'aaa'

      mail.__get__('transporter').sendMail = (data, cb) => { cb() }
      mail.__get__('logger').error = () => { throw new Error('should not be call') }
      mail.__get__('logger').info = (msg, _data) => {
        assert(msg === 'send mail success')
        assert(_data === data)
      }

      mail.sendMail(data)
    })

    it('should call 5 times when fail', function () {
      let data = 'aaa'
      let err = new Error('5 times error')
      let times = 5

      mail.__get__('transporter').sendMail = (data, cb) => { cb(err) }
      mail.__get__('logger').error = (msg, _err, _data) => {
        if (--times < 0) {
          assert(msg === 'send mail finally error')
          assert(data === _err)
        } else {
          assert(msg === 'send mail error')
          assert(err === _err)
          assert(data === _data)
        }
      }
      mail.__get__('logger').info = (msg, _data) => { throw new Error('should not be call') }

      mail.sendMail(data)
    })
  })

  describe('sendActiveMail', function () {
    it('should success', async function () {
      let data = {
        to: 'aaa',
        token: 'bbb',
        name: 'ccc'
      }

      mail.__get__('transporter').sendMail = (data, cb) => { cb() }
      mail.__get__('logger').error = () => { throw new Error('should not be call') }
      mail.__get__('logger').info = (msg, _data) => {
        assert(msg === 'send mail success')
        assert(_data.subject === `${config.site.name}社区账号激活`)
      }

      mail.sendActiveMail(data)
    })
  })

  describe('sendResetPassMail', function () {
    it('should success', async function () {
      let data = {
        to: 'aaa',
        token: 'bbb',
        name: 'ccc'
      }

      mail.__get__('transporter').sendMail = (data, cb) => { cb() }
      mail.__get__('logger').error = () => { throw new Error('should not be call') }
      mail.__get__('logger').info = (msg, _data) => {
        assert(msg === 'send mail success')
        assert(_data.subject === `${config.site.name}社区密码重置`)
      }

      mail.sendResetPassMail(data)
    })
  })
})
