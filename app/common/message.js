'use strict'

const MessageModel = require('../model').Message;

module.exports = exports = {
  sendAtMessage: (master_id, author_id, topic_id, reply_id) => {
    return exports.sendMessage('at', master_id, author_id, topic_id, reply_id);
  },
  sendReplyMessage: (master_id, author_id, topic_id, reply_id) => {
    return exports.sendMessage('reply', master_id, author_id, topic_id, reply_id, callback)
  },
  sendMessage: (type, master_id, author_id, topic_id, reply_id) => {
    return new Message({
      type: type,
      master_id: master_id,
      author_id: author_id,
      topic_id: topic_id,
      reply_id: reply_id
    }).save();
  }
}
