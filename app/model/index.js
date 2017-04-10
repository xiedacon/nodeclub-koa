'use strict'
const mongoose = require('mongoose');
const db = require('config-lite').db;
const logger = require('config-lite').logger;

mongoose.Promise = global.Promise;

mongoose.connect(db.uri, db.options, (err) => {
  if(err){
    logger.error('connect to %s error: ', db.uri, err.message);
    process.exit(1);
  }
})

module.exports = {
  User: require('./user.js'),
  Topic: require('./topic.js'),
  Reply: require('./reply.js'),
  TopicCollect: require('./topic_collect.js'),
  Message: require('./message.js')
};
