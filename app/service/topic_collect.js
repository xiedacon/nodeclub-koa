'use strict'
const { TopicCollect } = require('../model')

module.exports = {
  get: (userId, topicId) => { },
  findByUserId: (userId, opt) => { },
  newAndSave: (userId, topicId) => {
    return new TopicCollect({
      user_id: userId,
      topic_id: topicId
    }).save()
  },
  remove: (userId, topicId) => { },
  getByQuery: (query) => {
    return TopicCollect.findOne(query)
  }
}
