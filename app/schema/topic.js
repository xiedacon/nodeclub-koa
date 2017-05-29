'use strict'
const helper = require('./helper.js')
const validator = require('validator')
const { Topic, TopicCollect, User } = require('../service')
const { create_post_per_day, site: { tabs } } = require('config-lite')

module.exports = {
  create: (ctx, next) => {
    if (!helper.userRequired(ctx)) return
    return next()
  },
  put: async (ctx, next) => {
    if (!helper.userRequired(ctx) ||
      !(await helper.peruserperday(ctx, 'create_topic', create_post_per_day, { showJson: false }))) return

    let title = validator.trim(ctx.request.body.title || '')
    let tab = validator.trim(ctx.request.body.tab || '')
    let content = validator.trim(ctx.request.body.t_content || '')
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
  index: async (ctx, next) => {
    let topic = await checkTopicExist(ctx, ctx.params.tid)
    if (!topic) return

    let author = await User.getById(topic.author_id)
    if (!author) return ctx.renderError('话题的作者丢了。')

    topic.author = author
    Object.assign(ctx.query, { topic: topic })

    return next()
  },
  showEdit: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return

    let topic = await checkTopicExist(ctx, ctx.params.tid)
    if (!topic) return

    if (!topic.author_id.equals(ctx.session.user._id) && !ctx.session.user.is_admin) return ctx.renderError('对不起，你不能编辑此话题。', 403)

    Object.assign(ctx.query, { topic: topic })
    return next()
  },
  update: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return

    let title = validator.trim(ctx.request.body.title || '')
    let tab = validator.trim(ctx.request.body.tab || '')
    let content = validator.trim(ctx.request.body.t_content || '')

    let topic = await checkTopicExist(ctx, ctx.params.tid)
    if (!topic) return

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
    let topicId = validator.trim(ctx.request.body.topic_id || '')

    if (!helper.isValid(topicId)) return ctx.send({ status: 'failed' }, 422)

    let [topic, topicCollect] = await Promise.all([
      Topic.getById(topicId),
      TopicCollect.getByQuery({ user_id: ctx.session.user._id, topic_id: topicId })
    ])

    if (!topic || topicCollect) return ctx.send({ status: 'failed' }, 422)

    Object.assign(ctx.query, { topic: topic })

    return next()
  },
  de_collect: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return
    let topicId = validator.trim(ctx.request.body.topic_id || '')

    if (!helper.isValid(topicId)) return ctx.send({ status: 'failed' }, 422)

    let [topic, topicCollect] = await Promise.all([
      Topic.getById(topicId),
      TopicCollect.getByQuery({ user_id: ctx.session.user._id, topic_id: topicId })
    ])

    if (!topic || !topicCollect) return ctx.send({ status: 'failed' }, 422)

    Object.assign(ctx.query, { topic: topic })

    return next()
  },
  delete: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return
    let user = ctx.session.user

    let topic = await checkTopicExist(ctx, ctx.params.tid)
    if (!topic) return

    if (!topic.author_id.equals(user._id) && !user.is_admin) return ctx.send({ success: false, message: '无权限' }, 403)

    Object.assign(ctx.query, { topic: topic })

    return next()
  },
  top: async (ctx, next) => {
    if (!helper.userRequired(ctx) || !ctx.session.user.is_admin) return

    let topic = await checkTopicExist(ctx, ctx.params.tid)
    if (!topic) return

    Object.assign(ctx.query, { topic: topic })

    return next()
  },
  good: async (ctx, next) => {
    if (!helper.userRequired(ctx) || !ctx.session.user.is_admin) return

    let topic = await checkTopicExist(ctx, ctx.params.tid)
    if (!topic) return

    Object.assign(ctx.query, { topic: topic })

    return next()
  },
  lock: async (ctx, next) => {
    if (!helper.userRequired(ctx) || !ctx.session.user.is_admin) return

    let topic = await checkTopicExist(ctx, ctx.params.tid)
    if (!topic) return

    Object.assign(ctx.query, { topic: topic })

    return next()
  }
}

function checkTopicFrom (title, tab, content) {
  return ((title === '') && '标题不能是空的。') ||
    ((title.length < 5 || title.length > 100) && '标题字数太多或太少。') ||
    ((!tab || tabs.find((pair) => { return tab === pair[0] }) < 0) && '必须选择一个版块。') ||
    ((content === '') && '内容不可为空')
}

async function checkTopicExist (ctx, topicId) {
  if (topicId.length !== 24) return ctx.renderError('此话题不存在或已被删除。')
  let topic = await Topic.getById(topicId)
  if (!topic) return ctx.renderError('此话题不存在或已被删除。')
  return topic
}
