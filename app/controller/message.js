'use strict'

const { Message, User, Topic, Reply } = require('../service')

module.exports = {
  index: async (ctx) => {
    let userId = ctx.session.user._id

    let [readMessages, unreadMessages] = await Promise
      .all([Message.findReadByUserId(userId), Message.findUnreadByUserId(userId)])
      .map((messages) => {
        return Promise.map(messages, (message) => {
          return Promise.join(
            User.getById(message.author_id),
            Topic.getById(message.topic_id),
            Reply.getById(message.reply_id),
            (author, topic, reply) => {
              message.author = author
              message.topic = topic
              message.reply = reply
              if (!author || !topic) message.is_invalid = true

              return message
            }
          )
        }).filter((message) => { return !message.is_invalid })
      })

    return Promise.all([
      Message.updateMessagesToRead(userId, unreadMessages),
      ctx.render('message/index', { has_read_messages: readMessages, hasnot_read_messages: unreadMessages })
    ])
  }
}
