'use strict'

const { rss } = require('config-lite')
const convert = require('data2xml')()
const markdown = require('../middleware/markdown.js')
const cache = require('../middleware/cache.js')
const { Topic, User } = require('../service')

module.exports = {
  index: async (ctx) => {
    if (!rss) ctx.send('Please set `rss` in config.js', 404)

    ctx.response.set('Content-Type', 'application/xml')

    let rssContent = await cache.get('rss', async () => {
      return convert('rss', {
        _attr: { version: '2.0' },
        channel: {
          title: rss.title,
          link: rss.link,
          language: rss.language,
          description: rss.description,
          item: await Promise.map(
            Topic.findByQuery({}, { limit: rss.max_rss_items, sort: '-create_at' }),
            async (topic) => {
              let author = (await User.getById(topic.author_id)) || {}
              return {
                title: topic.title,
                link: `${rss.link}/topic/${topic._id}`,
                guid: `${rss.link}/topic/${topic._id}`,
                description: markdown(topic.content),
                author: author.loginname,
                pubDate: topic.create_at.toUTCString()
              }
            }
          )
        }
      })
    }, 60 * 5) // 五分钟

    return ctx.send(rssContent)
  }
}
