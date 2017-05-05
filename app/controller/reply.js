'use strict'

const { User, Topic, Reply } = require('../service')
const message = require('../common/message.js')
const at = require('../common/at.js')

module.exports = {
  /**
 * 添加回复
 */
  add: (ctx) => {
    let topic = ctx.query.topic
    let content = ctx.query.content
    let replyId = ctx.query.replyId
    let replyAuthor = ctx.session.user

    return Promise.join(
      Reply.newAndSave(content, topic._id, replyAuthor._id, replyId),
      User.getById(topic.author_id),
      (reply, topicAuthor) => {
        replyAuthor.score += 5
        replyAuthor.reply_count += 1

        // 发送at消息，并防止重复 at 作者
        at.sendMessageToMentionUsers(
          content.replace(`@${topicAuthor.loginname}`, ''),
          topic._id,
          ctx.session.user._id,
          reply._id
        )

        return Promise.all([
          User.update(
            { _id: replyAuthor._id },
            { score: replyAuthor.score, reply_count: replyAuthor.reply_count }
          ),
          Topic.updateLastReply(topic._id, reply._id).then(() => {
            if (!topic.author_id.equals(replyAuthor._id)) {
              message.sendReplyMessage(topic.author_id, replyAuthor._id, topic._id, reply._id)
            }
          })
        ]).then(() => {
          ctx.redirect(`/topic/${topic._id}#${reply._id}`)
        })
      }
    )
  },
  /**
   * 打开回复编辑器
   */
  showEdit: (ctx) => {
    let reply = ctx.query.reply

    return ctx.render('reply/edit', {
      reply_id: reply._id,
      content: at.linkUsers(reply.content)
    })
  },
  update: async (ctx) => {
    let reply = ctx.query.reply

    await Reply.update(
      { _id: reply._id },
      { content: reply.content, update_at: new Date() }
    )

    ctx.redirect(`/topic/${reply.topic_id}#${reply._id}`)
  },
  delete: () => { },
  up: async (ctx, next) => {
    let reply = ctx.query.reply
    let userId = ctx.query.userId
    let action, index

    action = (index = (reply.ups || []).indexOf(userId)) < 0
      ? (reply.ups.push(userId) && 'up')
      : (reply.ups.splice(index, 1) && 'down')

    await Reply.update(
      { _id: reply._id },
      { ups: reply.ups }
    )

    ctx.body = { success: true, action: action }
  }
}
