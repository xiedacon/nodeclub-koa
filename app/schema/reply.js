'use strict'

const validator = require('validator')
const { Topic, Reply } = require('../service')
const helper = require('./helper.js')

module.exports = {
  add: async (ctx, next) => {
    if (!helper.userRequired(ctx)) return

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
  }
}
