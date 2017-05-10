'use strict'
const cache = require('../middleware/cache.js')
const xmlbuilder = require('xmlbuilder')
const { site: { list_topic_count: limit } } = require('config-lite')
const { Topic, User } = require('../service')

module.exports = {
  index: (ctx) => {
    let page = ctx.query.page || 1
    page = page > 0 ? page : 1
    let tab = ctx.query.tab || 'all'
    let query = tab === 'good'
      ? { good: true }
      : { tab: tab === 'all' ? { $ne: 'job' } : tab }

    return Promise.join(
      Topic.findFullTopicByQuery(
        query,
        { skip: (page - 1) * limit, limit: limit }
      ),
      // 取排行榜上的用户
      cache.get('tops', () => {
        return User.findByQuery(
          { is_block: false },
          { limit: 10 }
        )
      }, 60 * 1),
      // END 取排行榜上的用户

      // 取0回复的主题
      cache.get('no_reply_topics', () => {
        return Topic.findByQuery(
          { reply_count: 0, tab: { $ne: 'job' } },
          { limit: 5, sort: '-create_at' }
        )
      }, 60 * 1),
      // END 取0回复的主题

      // 取分页数据
      cache.get(`${JSON.stringify(query)}pages`, async () => {
        return Math.ceil(await Topic.getCountByQuery(query) / limit)
      }, 60 * 1),
      // END 取分页数据

      (topics, tops, noReplyTopics, pages) => {
        return ctx.render('index', {
          topics: topics,
          current_page: page,
          list_topic_count: limit,
          tops: tops,
          no_reply_topics: noReplyTopics,
          pages: pages,
          tab: tab
        })
      }
    )
  },
  sitemap: async (ctx) => {
    let urlset = xmlbuilder.create('urlset', { version: '1.0', encoding: 'UTF-8' })
    urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')

    let sitemap = await cache.get('sitemap', async () => {
      let topics = await Topic.getLimit5w()

      topics.forEach((topic) => {
        urlset.ele('url').ele('loc', `http://cnodejs.org/topic/${topic._id}`)
      })

      return urlset.end()
    }, 24 * 60 * 60) // 缓存一天

    ctx.type = 'xml'
    ctx.send(sitemap)
  },
  appDownload: (ctx) => {
    ctx.redirect('https://github.com/soliury/noder-react-native/blob/master/README.md')
  }
}
