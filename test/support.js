'use strict'

process.env.NODE_ENV = 'test'

const app = require('../app.js')
const request = require('supertest')(app.listen())
const { User } = require('../app/service')
const tools = require('../app/common/tools.js')
const config = require('config-lite')

const uuid = ((i) => { return () => { return `${i++}yyyytest${Date.now()}` } })(0)
const template = {
  get User () {
    let key = uuid()
    return {
      loginname: key,
      email: `${key}@qq.com`,
      pass: 'test',
      active: true
    }
  }
}

const helper = {
  includes: (str, ...parts) => {
    if (!parts) return

    parts = (function reduce (oldParts, newParts) {
      return oldParts.reduce((parts, part) => {
        if (Array.isArray(part)) return reduce(part, parts)
        parts.push(part)
        return parts
      }, newParts)
    })(parts, [])

    return parts.reduce((result, part) => { if (result) return str.includes(part) }, true)
  },
  createUser: async (doc, unsave) => {
    doc = Object.assign(template.User, doc)

    if (unsave) return doc

    let user = await User.newAndSave({
      name: doc.loginname.toLowerCase(),
      loginname: doc.loginname.toLowerCase(),
      pass: await tools.bhash(doc.pass),
      email: doc.email.toLowerCase(),
      avatar_url: tools.makeGravatar(doc.email),
      active: doc.active
    })

    user = user.toObject({ virtual: true })
    user.pass_db = user.pass
    user.pass = doc.pass

    if (!user.active) return user

    await request
      .post('/signin')
      .send({
        name: user.loginname,
        pass: user.pass
      })
      .expect((res) => {
        user.cookie = res.headers['set-cookie'].reduce((str, cookie) => {
          return str + cookie.split(';')[0] + ';'
        }, '')
      })

    return user
  },
  createAdmin: async (doc) => {
    let admin = await helper.createUser(doc)
    config.admin.names.push(admin.name)
    return admin
  }
}

module.exports = {
  request: request,
  config: config,
  helper: helper,
  tools: tools,
  User: User
}
