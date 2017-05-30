'use strict'

process.env.NODE_ENV = 'test'

const app = require('../app.js')
const request = require('supertest')(app.listen())
const { User, Topic, Reply } = require('../app/service')
const tools = require('../app/common/tools.js')
const config = require('config-lite')

const uuid = ((i) => { return () => { return `${i++}yyyytest${Date.now()}` } })(0)
const tabs = ['share', 'ask', 'job']
const template = {
  get User () {
    let key = uuid()
    return {
      loginname: key,
      email: `${key}@qq.com`,
      pass: 'test',
      active: true
    }
  },
  get Topic () {
    let key = uuid()
    return {
      title: key,
      content: `${key} test content`,
      tab: tabs[parseInt(Math.random() * tabs.length)]
    }
  },
  get Reply () {
    let key = uuid()
    return {
      content: `${key} test content`
    }
  }
}

let defaultAuthor, defaultTopic

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
  },
  createTopic: async (doc, unsave) => {
    doc = Object.assign(template.Topic, doc)

    doc.authorId = doc.authorId
      ? doc.authorId
      : (defaultAuthor || (defaultAuthor = await helper.createUser()))._id

    if (unsave) return doc

    let topic = await Topic.newAndSave({
      title: doc.title,
      content: doc.content,
      tab: doc.tab,
      author_id: doc.authorId,
      deleted: doc.deleted,
      lock: doc.lock
    })

    return topic.toObject({ virtual: true })
  },
  createReply: async (doc, unsave) => {
    doc = Object.assign(template.Reply, doc)

    doc.topicId = doc.topicId
      ? doc.topicId
      : (defaultTopic || (defaultTopic = await helper.createTopic()))._id

    doc.authorId = doc.authorId
      ? doc.authorId
      : (defaultAuthor || (defaultAuthor = await helper.createUser()))._id

    if (unsave) return doc

    let reply = await Reply.newAndSave({
      content: doc.content,
      topic_id: doc.topicId,
      author_id: doc.authorId,
      reply_id: doc.replyId,
      deleted: doc.deleted
    })

    return reply.toObject({ virtual: true })
  }
}

module.exports = {
  request: request,
  config: config,
  helper: helper,
  tools: tools,
  User: User,
  Topic: Topic,
  uuid: uuid
}
