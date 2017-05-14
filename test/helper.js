'use strict'

const { User } = require('../app/service')
const tools = require('../app/common/tools.js')

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

module.exports = {
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
    return user
  }
}
