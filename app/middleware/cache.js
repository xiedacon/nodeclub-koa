'use strict'
const redis = require('config-lite').redisClient;
const Promiss = require('bluebird');

module.exports = {
  // key未命中执行getDate
  // time 参数可选，秒为单位
  get: (key, getDate, time) => {
    let t = new Date();
    return redis.getAsync(key).then((data) => {
      data = JSON.parse(data);
      logger.debug('Cache', 'get', key, ((new Date() - t) + 'ms').green);
      if(!data && getDate && typeof getDate === 'function'){
        return getDate().then((data) => {
          return this.set(key, data, time);
        });
      }else{
        return Promiss.resolve(data);
      }
    });
  },
  // time 参数可选，秒为单位
  set: (key, value, time) => {
    let t = new Date();
    return (time
        ? redis.setexAsync(key, time, value)
        : redis.setAsync(key, time)
    ).then(() => {
      logger.debug("Cache", "set", key, ((new Date() - t) + 'ms').green);
      return Promiss.resolve(value);
    });
  }
}
