'use strict'

const schema = require('../../app/schema/helper.js')
const { helper } = require('../support.js')
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

  })
})
