'use strict'
const { TopicCollect } = require('../model')

module.exports = {
  get: (userId, topicId) => { },
  findByUserId: (userId, opt) => {
    (opt = opt || {}).sort = { create_at: -1 }
    return TopicCollect.find({ user_id: userId }, {}, opt)
  },
  newAndSave: (userId, topicId) => {
    return new TopicCollect({
      user_id: userId,
      topic_id: topicId
    }).save()
  },
  remove: (userId, topicId) => {
    return TopicCollect.remove({ user_id: userId, topic_id: topicId })
  },
  getByQuery: (query) => {
    return TopicCollect.findOne(query)
  }
}
