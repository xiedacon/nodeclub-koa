'use strict'
const client = require('./redis.js');
const logger = require('./logger.js');

module.exports = {
  /**
   * 
   * 
   * @param {any} key 
   * @param {Function} getData 
   * @param {Integer} time 
   * @returns 
   */
  async get(key, getData, time) {
    let t = Date.now();
    let data = JSON.parse(await client.getAsync(key));
    logger.debug('Cache', 'get', key, ((Date.now() - t) + 'ms').green);
    if (!data && typeof getData === 'function') {
      await this.set(key, await getData(), time);
    }

    return data;
  },
  /**
   * 
   * 
   * @param {any} key 
   * @param {any} value 
   * @param {Integer} time 
   */
  async set(key, value, time) {
    let t = Date.now();
    value = JSON.stringify(value);

    if (time) await client.setAsync(key, value, 'EX', time);
    await client.setAsync(key, value);

    logger.debug("Cache", "set", key, ((Date.now() - t) + 'ms').green);
  },

  /**
   * 
   * 
   * @param {any} key 
   * @returns 
   */
  del(key) {
    return client.delAsync(key);
  }
}
