'use strict'

const { User, Topic, Reply } = require('../service')
const tools = require('../common/tools.js')
const { session: { secret }, site: { list_topic_count: limit } } = require('config-lite')

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
          .map((reply) => { return reply.topic_id.toString() })
          .forEach((topicId) => {
            ids.indexOf(topicId) < 0 && ids.push(topicId)
          })
        ids = ids.slice(0, 5) //  只显示最近5条

        let topics = await Topic.findFullTopicByQuery({ _id: { '$in': ids } })
        topics.sort((x, y) => { return ids.indexOf(x._id.toString()) - ids.indexOf(y._id.toString()) })
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
  listTopics: (ctx) => {
    let user = ctx.query.user
    let page = ctx.query.page || 1

    return Promise.join(
      Topic.findFullTopicByQuery(
        { author_id: user._id },
        { skip: (page - 1) * limit, limit: limit, sort: '-create_at' }
      ),
      Topic.getCountByQuery({ author_id: user._id }).then((count) => {
        return Math.ceil(count / limit)
      }),
      (topics, pages) => {
        return ctx.render('user/topics', {
          user: user,
          topics: topics,
          current_page: page,
          pages: pages
        })
      }
    )
  },
  listReplies: (ctx) => {
    let user = ctx.query.user
    let page = ctx.query.page || 1
    let limit = 50

    return Promise.join(
      Reply.findByAuthorId(user._id, { skip: (page - 1) * limit, limit: limit, sort: '-create_at' }).then(async (replies) => {
        let ids = []
        replies
          .map((reply) => { return reply.topic_id.toString() })
          .forEach((topicId) => { ids.indexOf(topicId) < 0 && ids.push(topicId) })

        let topics = await Topic.findFullTopicByQuery({ _id: { '$in': ids } })
        topics.sort((x, y) => { return ids.indexOf(x._id.toString()) - ids.indexOf(y._id.toString()) })
        return topics
      }),
      Reply.getCountByQuery({ author_id: user._id }).then((count) => {
        return Math.ceil(count / limit)
      }),
      (topics, pages) => {
        return ctx.render('user/replies', {
          user: user,
          topics: topics,
          current_page: page,
          pages: pages
        })
      }
    )
  },
  toggleStar: async (ctx) => {
    let user = ctx.query.user

    user.is_star = !user.is_star

    await User.update(
      { _id: user._id },
      { is_star: user.is_star }
    )

    ctx.send({ status: 'success' })
  },
  block: async (ctx) => {
    let user = ctx.query.user
    let action = ctx.request.body.action

    user.is_block =
      ((action === 'set_block') && true) ||
      ((action === 'cancel_block') && false)

    await User.update(
      { _id: user._id },
      { is_block: user.is_block }
    )

    ctx.send({ status: 'success' })
  },
  deleteAll: (ctx) => {
    let user = ctx.query.user

    return Promise.all([
      // 删除主题
      Topic.update(
        { author_id: user._id },
        { deleted: true },
        { multi: true }
      ),
      // 删除评论
      Reply.update(
        { author_id: user._id },
        { deleted: true },
        { multi: true }
      ),
      // 点赞数也全部干掉
      Reply.updateRaw(
        {},
        { $pull: { ups: user._id } },
        { multi: true }
      )
    ]).then(() => { ctx.send({ status: 'success' }) })
  }
}
