'use strict'
const TopicCollect = require('../model').TopicCollect;
const _ = require('lodash');

module.exports = {
  get: (userId, topicId) => {
    return TopicCollect.findOneAsync({user_id: userId, topic_id: topicId});
  },
  findByUserId: (userId, opt) => {
    opt = _.assign({sort: '-create_at'}, opt);
    return TopicCollect.findAsync({user_id: userId, '', opt});
  },
  newAndSave: (userId, topicId) => {
    return new TopicCollect({
      user_id: userId,
      topic_id: topicId
    }).saveAsync();
  },
  remove: (userId, topicId) => {
    return TopicCollect.removeAsync({user_id: userId, topic_id: topicId});
  }
};
