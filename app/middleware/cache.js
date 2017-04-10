'use strict'
const client = require('./redis.js');
const logger = require('config-lite').logger;

module.exports = {
  // key未命中执行getDate
  // time 参数可选，秒为单位
  get: async (key, getDate, time) => {
    let t = Date.now();
    let data = JSON.parse(await client.get(key));
    logger.debug('Cache', 'get', key, ((Date.now() - t) + 'ms').green);
console.log(await client.get(key))
    if(!data && typeof getDate === 'function'){
      data = await getDate();
      await this.set(key, data, time);
    }

    return data;
  },
  // time 参数可选，秒为单位
  set: async (key, value, time) => {
    let t = Date.now();
    value = JSON.stringify(value);

    if(time) await client.set(key, value, 'EX', time);
    else await client.set(key, value);

    logger.debug("Cache", "set", key, ((Date.now() - t) + 'ms').green);
  }
}
