'use strict'

const validator = require('validator')
const { Topic, Reply } = require('../service')
const helper = require('./helper.js')
const config = require('config-lite')

module.exports = {
  add: async (ctx, next) => {
    if (!helper.userRequired(ctx) ||
      !(await helper.peruserperday(ctx, 'create_reply', config.create_reply_per_day, { showJson: false }))) return

    let content = validator.trim(ctx.request.body.r_content)
    let topicId = ctx.params.topic_id
    let replyId = ctx.request.body.replyId

    if (content === '') return ctx.renderError('回复内容不能为空!', 422)

    let topic = await Topic.getById(topicId)
    if (!topic) return // just 404 page
    if (topic.lock) return ctx.renderError('此主题已锁定。', 403)

    Object.assign(ctx.query, { topic: topic, content: content, replyId: replyId })

    return next()
  },
  showEdit: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return

    let reply = await Reply.getById(ctx.params.reply_id)
    if (!reply) return ctx.renderError('此回复不存在或已被删除。')

    if (!ctx.session.user._id.equals(reply.author_id) && ctx.session.user.isAdmin) return ctx.renderError('对不起，你不能编辑此回复。', 403)

    Object.assign(ctx.query, { reply: reply })

    return next()
  },
  update: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return
    let content = validator.trim(ctx.request.body.t_content)

    let reply = await Reply.getById(ctx.params.reply_id)
    if (!reply) return ctx.renderError('此回复不存在或已被删除。')

    if (!ctx.session.user._id.equals(reply.author_id) && !ctx.session.user.isAdmin) return ctx.renderError('对不起，你不能编辑此回复。', 403)

    if (content === '') return ctx.renderError('回复的字数太少。', 400)

    reply.content = content
    Object.assign(ctx.query, { reply: reply })

    return next()
  },
  up: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return

    let reply = await Reply.getById(ctx.params.reply_id)
    if (!reply) return ctx.renderError('此回复不存在或已被删除。')
    // 不能帮自己点赞
    if (ctx.session.user._id.equals(reply.author_id)) return ctx.send({ success: false, message: '呵呵，不能帮自己点赞。' })

    Object.assign(ctx.query, { reply: reply, userId: ctx.session.user._id })

    return next()
  },
  delete: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return
    let replyId = ctx.params.reply_id

    let reply = await Reply.getById(replyId)
    if (!reply) return ctx.send({ status: `no reply ${replyId} exists` }, 422)

    if (!ctx.session.user._id.equals(reply.author_id) && !ctx.session.user.isAdmin) return ctx.send({ status: 'failed' })

    Object.assign(ctx.query, { reply: reply })

    return next()
  }
}
