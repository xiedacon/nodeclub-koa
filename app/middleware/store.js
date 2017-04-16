const client = require('./cache.js');
const {
  Store
} = require("koa-session2");

class RedisStore extends Store {
  constructor() {
    super();
    this.redis = client;
  }

  async get(sid) {
    let data = await this.redis.get(`SESSION:${sid}`);
    return JSON.parse(data);
  }

  async set(session, {
    sid = this.getID(24),
    maxAge = 30 * 60
  } = {}) {
    await this.redis.set(`SESSION:${sid}`, JSON.stringify(session), maxAge);
    return sid;
  }

  destroy(sid) {
    return this.redis.del(`SESSION:${sid}`);
  }
}

module.exports = RedisStore;
