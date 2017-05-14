'use strict'

const { User } = require('../app/service')
const tools = require('../app/common/tools.js')

module.exports = {
  includes: (str, ...parts) => {
    if (!parts) return

    return parts.reduce((result, part) => { if (result) return str.includes(part) }, true)
  },
  createUser: async (doc) => {
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
