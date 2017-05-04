'use strict'
const { Topic, User, TopicCollect, Reply } = require('../service')
const at = require('../common/at.js')
const cache = require('../middleware/cache.js')
const logger = require('../middleware/logger.js')

module.exports = {
  create: (ctx) => {
    return ctx.render('topic/edit')
  },
  index: (ctx) => {
    let topicId = ctx.params.tid
    let currentUser = ctx.session.user
    return Promise.join(
      Topic.getById(topicId).then((topic) => {
        if (!topic) throw new Error('Error:此话题不存在或已被删除。')
        return Promise.join(
          at.linkUsers(topic.content),
          User.getById(topic.author_id),
          Reply.findByTopicId(topic._id),
          // get author_other_topics
          Topic.findByQuery(
            { author_id: topic.author_id, _id: { '$nin': [topic._id] } },
            { limit: 5 }
          ),
          async (linkedContent, author, replies, otherTopics) => {
            if (!author) throw new Error('Error:话题的作者丢了。')
            topic.visit_count += 1
            // !!! 不使用await，不执行
            await Topic.update(
              { _id: topic._id },
              { visit_count: topic.visit_count }
            )

            topic.linkedContent = linkedContent
            topic.author = author
            topic.replies = replies
            // 点赞数排名第三的回答，它的点赞数就是阈值
            topic.reply_up_threshold = (() => {
              let allUpCount = replies.map((reply) => {
                return (reply.ups && reply.ups.length) || 0
              }).sort((pre, next) => {
                return next - pre
              })

              let threshold = allUpCount[2] || 0
              if (threshold < 3) threshold = 3
              return threshold
            })()

            return {
              topic: topic,
              author_other_topics: otherTopics
            }
          }
        )
      }),
      // 取0回复的主题
      cache.get('no_reply_topics', () => {
        return Topic.findByQuery(
          { reply_count: 0, tab: { $ne: 'job' } },
          { limit: 5, sort: '-create_at' }
        )
      }, 60 * 1),
      currentUser
        ? TopicCollect.getByQuery({ user_id: currentUser._id, topic_id: topicId })
        : null,
      ({ topic, author_other_topics }, noReplyTopics, isCollect) => {
        return ctx.render('topic/index', {
          topic: topic,
          author_other_topics: author_other_topics,
          no_reply_topics: noReplyTopics,
          is_collect: isCollect,
          is_uped: (user, reply) => {
            if (!reply.ups) return false
            return reply.ups.indexOf(user._id) !== -1
          }
        })
      }
    ).catch((e) => {
      if (/^Error:\w+/.test(e.message)) {
        logger.error(`getFullTopic error topic_id: ${topicId}`)
        return ctx.renderError(e.message.match(/^Error:(w+)/)[1])
      }
      throw e
    })
  },
  top: () => { },
  good: () => { },
  showEdit: () => { },
  lock: () => { },
  delete: () => { },
  put: (ctx) => {
    let title = ctx.query.title
    let tab = ctx.query.tab
    let content = ctx.query.content
    let user = ctx.session.user
    user.score += 5
    user.topic_count += 1

    return Promise.join(
      Topic.newAndSave(title, content, tab, user._id),
      User.update(
        { _id: user.id },
        { score: user.score, topic_count: user.topic_count }),
      (topic) => {
        // 发送at消息
        at.sendMessageToMentionUsers(content, topic._id, user._id)
        ctx.redirect(`/topic/${topic._id}`)
      }
    )
  },
  update: () => { },
  collect: () => { },
  de_collect: () => { },
  upload: () => { }
}
