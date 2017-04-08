'use strict'
const redis_config = require('config-lite').redis_config;
const redis = require('redis');
const logger = require('config-lite').logger;
const Promiss = require('bluebird');

const client = redis.createClient(redis_config);

client.on('error', (err) => {
  if(err){
    logger.error('connect to redis error, check your redis config', err);
    process.exit(1);
  }
});

module.exports = {
  // key未命中执行getDate
  // time 参数可选，秒为单位
  get: async (key, getDate, time) => {
    let t = Date.now();
    let data = JSON.parse(await client.get(key));
    logger.debug('Cache', 'get', key, ((Date.now() - t) + 'ms').green);

    if(!data && typeof getDate === 'function'){
      data = await getDate();
      this.set(key, data, time);
    }

    return data;
  },
  // time 参数可选，秒为单位
  set: async (key, value, time) => {
    let t = Date.now();
    value = JSON.stringify(value);

    await client.set(key, value);
    if(time) await client.expire(key, time);

    logger.debug("Cache", "set", key, ((Date.now() - t) + 'ms').green);
  }
}
