'use strict'
const helper = require('./helper.js')
const validator = require('validator')
const { Topic, TopicCollect } = require('../service')

const config = require('config-lite')
const tabs = config.site.tabs

module.exports = {
  create: (ctx, next) => {
    if (!helper.userRequired(ctx)) return
    return next()
  },
  put: async (ctx, next) => {
    if (!helper.userRequired(ctx) ||
      !(await helper.peruserperday(ctx, 'create_topic', config.create_post_per_day, { showJson: false }))) return

    let title = validator.trim(ctx.request.body.title)
    let tab = validator.trim(ctx.request.body.tab)
    let content = validator.trim(ctx.request.body.t_content)
    let error = checkTopicFrom(title, tab, content)

    if (error) {
      return ctx.renderError({
        edit_error: error,
        title: title,
        tab: tab,
        content: content
      }, 422, 'topic/edit')
    }

    Object.assign(ctx.query, {
      title: title,
      tab: tab,
      content: content
    })

    return next()
  },
  index: (ctx, next) => {
    let topicId = ctx.params.tid

    if (topicId.length !== 24) return ctx.renderError('此话题不存在或已被删除。', 404)

    return next()
  },
  showEdit: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return

    let topicId = ctx.params.tid

    let topic = await Topic.getById(topicId)

    if (!topic) return ctx.renderError('此话题不存在或已被删除。')

    if (!topic.author_id.equals(ctx.session.user._id) && !ctx.session.user.is_admin) {
      return ctx.renderError('对不起，你不能编辑此话题。', 403)
    }

    Object.assign(ctx.query, { topic: topic })
    return next()
  },
  update: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return

    let topicId = ctx.params.tid
    let title = validator.trim(ctx.request.body.title)
    let tab = validator.trim(ctx.request.body.tab)
    let content = validator.trim(ctx.request.body.t_content)

    let topic = await Topic.getById(topicId)

    if (!topic) return ctx.renderError('此话题不存在或已被删除。')

    if (!topic.author_id.equals(ctx.session.user._id) && !ctx.session.user.is_admin) return ctx.renderError('对不起，你不能编辑此话题。', 403)

    let error = checkTopicFrom(title, tab, content)

    if (error) {
      return ctx.renderError({
        edit_error: error,
        title: title,
        tab: tab,
        content: content
      }, 422, 'topic/edit')
    }

    topic.title = title
    topic.tab = tab
    topic.content = content

    Object.assign(ctx.query, { topic: topic })

    return next()
  },
  collect: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return
    let topicId = validator.trim(ctx.request.body.topic_id)

    let { topic, topicCollect } = await Promise.props({
      topic: Topic.getById(topicId),
      topicCollect: TopicCollect.getByQuery({ user_id: ctx.session.user._id, topic_id: topicId })
    })

    if (!topic || topicCollect) return ctx.send({ status: 'failed' })

    Object.assign(ctx.query, {topic: topic})

    return next()
  }
}

function checkTopicFrom (title, tab, content) {
  return ((title === '') && '标题不能是空的。') ||
    ((title.length < 5 || title.length > 100) && '标题字数太多或太少。') ||
    ((!tab || tabs.find((pair) => { return tab === pair[0] }) < 0) && '必须选择一个版块。') ||
    ((content === '') && '内容不可为空')
}
