'use strict'
const redis_config = require('config-lite').redis_config;
const redis = require('redis');
const logger = require('config-lite').logger;

const client = redis.createClient(redis_config);

client.on('error', (err) => {
  if(err){
    logger.error('connect to redis error, check your redis config', err);
    process.exit(1);
  }
});

module.exports = client;
