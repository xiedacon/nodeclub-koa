const client = require("./redis.js");
const { Store } = require("koa-session2");

class RedisStore extends Store {
    constructor() {
        super();
        this.redis = client;
    }

    async get(sid) {
        let data = await this.redis.get(`SESSION:${sid}`);
        return JSON.parse(data);
    }

    async set(session, { sid =  this.getID(24), maxAge = 30 * 60 } = {}) {
        try {
            // Use redis set EX to automatically drop expired sessions
            await this.redis.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge);
            //await this.redis.expire(`SESSION:${sid}`, maxAge / 1000);
        } catch (e) {}
        return sid;
    }

    async destroy(sid) {
        return await this.redis.del(`SESSION:${sid}`);
    }
}

module.exports = RedisStore;
