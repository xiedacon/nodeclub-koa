'use strict'

const { Topic, Reply } = require('../service')
const tools = require('../common/tools.js')
const secret = require('config-lite').session.secret

module.exports = {
  index: (ctx) => {
    let user = ctx.query.user

    return Promise.join(
      Topic.findFullTopicByQuery(
        { author_id: user._id },
        { limit: 5, sort: '-create_at' }
      ),
      Reply.findByAuthorId(user._id, { limit: 20, sort: '-create_at' }).then(async (replies) => {
        let ids = []
        replies
          .map((reply) => { return reply.topic_id })
          .forEach((topicId) => { ids.indexOf(topicId) < 0 && ids.push(topicId) })
        ids = ids.slice(0, 5) //  只显示最近5条

        let topics = await Topic.findFullTopicByQuery({ _id: { '$in': ids } })
        topics.sort((x, y) => { return ids.indexOf(x._id) - ids.indexOf(y._id) })
        return topics
      }),
      (recentTopics, recentReplies) => {
        user.url = (user.url && user.url.indexof('http') !== 0)
          ? `http://${user.url}`
          : user.url

        // 如果用户没有激活，那么管理员可以帮忙激活
        let token = (!user.active && ctx.session.user && ctx.session.user.is_admin)
          ? tools.md5(user.email + user.pass + secret)
          : ''

        return ctx.render('user/index', {
          user: user,
          recent_topics: recentTopics,
          recent_replies: recentReplies,
          token: token,
          pageTitle: `@${user.loginname} 的个人主页`
        })
      }
    )
  },
  showSetting: () => { },
  setting: () => { },
  listStars: () => { },
  top100: () => { },
  listCollectedTopics: () => { },
  listTopics: () => { },
  listReplies: () => { },
  toggleStar: () => { },
  block: () => { },
  deleteAll: () => { }
}
