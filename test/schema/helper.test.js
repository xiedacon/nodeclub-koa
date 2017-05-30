'use strict'

const schema = require('../../app/schema/helper.js')
const { helper, uuid } = require('../support.js')
const assert = require('power-assert')
const rewire = require('rewire')

describe('test/schema/helper.test.js', function () {
  describe('#userRequired', function () {
    let ctx = {
      send: () => { }
    }

    it('should return false when session, session user or sesssion user._id not exist', function () {
      assert(!schema.userRequired(ctx))
      ctx.session = {}
      assert(!schema.userRequired(ctx))
      ctx.session.user = {}
      assert(!schema.userRequired(ctx))
    })

    it('should return true', function () {
      ctx.session.user._id = 'aaa'
      assert(schema.userRequired(ctx))
    })
  })

  describe('#peruserperday', function () {
    // see #makePerDayLimiter
  })

  describe('#peripperday', function () {
    it('should provice `x-real-ip` header', async function () {
      let err
      try {
        await schema.peripperday({ request: { get: () => { } } })
      } catch (error) {
        err = error
      } finally {
        assert(err)
        assert(helper.includes(err.toString(), 'should provice `x-real-ip` header'))
      }
    })
  })

  describe('#makePerDayLimiter', function () {
    let _schema = rewire('../../app/schema/helper.js').__get__('makePerDayLimiter')('test', () => { return 'test' })
    let ctx = {
      response: { set: () => { } }
    }

    it('should return true when count < limitCount', async function () {
      assert(await _schema(ctx, uuid(), 5))
    })

    it('should return false and call ctx.send when count < limitCount and options.showJson is given', async function () {
      ctx.send = (msg, code) => {
        assert(msg === JSON.stringify({ success: false, error_msg: `频率限制：当前操作每天可以进行 -1 次` }))
        assert(code === 403)
      }
      ctx.renderError = () => { throw new Error('should not call this') }
      assert(!await _schema(ctx, uuid(), -1, { showJson: true }))
    })

    it('should return false and call ctx.renderError when count < limitCount but options.showJson is not given', async function () {
      ctx.send = () => { throw new Error('should not call this') }
      ctx.renderError = (msg, code) => {
        assert(msg === '频率限制：当前操作每天可以进行 -1 次')
        assert(code === 403)
      }
      assert(!await _schema(ctx, uuid(), -1, {}))
    })
  })
})
