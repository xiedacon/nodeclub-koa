'use strict'
const { TopicCollect } = require('../model')

module.exports = {
  get: (userId, topicId) => { },
  findByUserId: (userId, opt) => { },
  newAndSave: (userId, topicId) => { },
  remove: (userId, topicId) => { },
  getByQuery: (query) => {
    return TopicCollect.findOne(query)
  }
}
