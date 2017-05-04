'use strict'
const cache = require('../middleware/cache.js')
const Promiss = require('bluebird')
const config = require('config-lite')
const { Topic, User, Reply } = require('../service')

module.exports = {
  index: (ctx) => {
    let page = parseInt(ctx.request.query.page, 10) || 1
    page = page > 0 ? page : 1
    let query = {}
    let tab = ctx.request.query.tab || 'all'
    if (tab === 'all') {
      query.tab = { $ne: 'job' }
    } else if (tab === 'good') {
      query.good = true
    } else {
      query.tab = tab
    }
    let limit = config.site.list_topic_count
    let options = { skip: (page - 1) * limit, limit: limit }

    return Promiss.join(
      (async () => {
        let topics = await Topic.findByQuery(query, options)
        return Promise.map(topics, (topic, i) => {
          return Promise.join(
            User.getById(topic.author_id),
            Reply.getById(topic.last_reply),
            (author, reply) => {
              // 保证顺序
              // 作者可能已被删除
              if (!author) return null

              topic.author = author
              topic.reply = reply
              return topic
            }
          )
        }).then((topics) => {
          return topics.filter((topic) => {
            return topic !== null
          })
        })
      })(),
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
        let tabName = config.site.tabs.find((part) => {
          return part[0] === tab
        })
        return ctx.render('index', {
          topics: topics,
          current_page: page,
          list_topic_count: limit,
          tops: tops,
          no_reply_topics: noReplyTopics,
          pages: pages,
          tab: tab,
          pageTitle: tabName && `${tabName}版块`
        })
      }
    )
  },
  sitemap: (ctx) => { },
  appDownload: (ctx) => { }
}
