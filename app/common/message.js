'use strict'

const { Message: MessageModel } = require('../model')

module.exports = exports = {
  sendAtMessage: (masterId, authorId, topicId, replyId) => {
    return exports.sendMessage('at', masterId, authorId, topicId, replyId)
  },
  sendReplyMessage: (masterId, authorId, topicId, replyId) => {
    return exports.sendMessage('reply', masterId, authorId, topicId, replyId)
  },
  sendMessage: (type, masterId, authorId, topicId, replyId) => {
    return new MessageModel({
      type: type,
      master_id: masterId,
      author_id: authorId,
      topic_id: topicId,
      reply_id: replyId
    }).save()
  }
}
