'use strict'
const { Topic, User, TopicCollect, Reply } = require('../service')
const at = require('../common/at.js')
const cache = require('../middleware/cache.js')
const { upload: { fileLimit } } = require('config-lite')
const store = require('../middleware/store.js')

module.exports = {
  create: (ctx) => {
    return ctx.render('topic/edit')
  },
  index: (ctx) => {
    let topic = ctx.query.topic
    let currentUser = ctx.session.user

    topic.linkedContent = at.linkUsers(topic.content)
    topic.visit_count += 1

    return Promise.join(
      Promise.map(Reply.findByTopicId(topic._id), async (reply) => {
        reply.author = (await User.getById(reply.author_id)) || { _id: '' }
        if (!reply.content_is_html) reply.content = at.linkUsers(reply.content)

        return reply
      }),
      // get author_other_topics
      Topic.findByQuery(
        { author_id: topic.author_id, _id: { '$nin': [topic._id] } },
        { limit: 5 }
      ),
      // 取0回复的主题
      cache.get('no_reply_topics', () => {
        return Topic.findByQuery(
          { reply_count: 0, tab: { $ne: 'job' } },
          { limit: 5, sort: '-create_at' }
        )
      }, 60 * 1),
      currentUser
        ? TopicCollect.getByQuery({ user_id: currentUser._id, topic_id: topic._id })
        : null,
      Topic.update(
        // !!! 不使用await，不执行
        { _id: topic._id },
        { visit_count: topic.visit_count }
      ),
      (replies, otherTopics, noReplyTopics, isCollect) => {
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

        return ctx.render('topic/index', {
          topic: topic,
          author_other_topics: otherTopics,
          no_reply_topics: noReplyTopics,
          is_collect: isCollect,
          is_uped: (user, reply) => {
            if (!reply.ups) return false
            return reply.ups.indexOf(user._id) !== -1
          }
        })
      }
    )
  },
  top: (ctx) => {
    let topic = ctx.query.topic
    let referer = ctx.get('referer')

    topic.top = !topic.top

    return Promise.all([
      Topic.update(
        { _id: topic._id },
        { top: topic.top }
      ),
      ctx.render('notify/notify', { success: topic.top ? '此话题已置顶。' : '此话题已取消置顶。', referer: referer })
    ])
  },
  good: (ctx) => {
    let topic = ctx.query.topic
    let referer = ctx.get('referer')

    topic.good = !topic.good

    return Promise.all([
      Topic.update(
        { _id: topic._id },
        { good: topic.good }
      ),
      ctx.render('notify/notify', { success: topic.good ? '此话题已加精。' : '此话题已取消加精。', referer: referer })
    ])
  },
  showEdit: (ctx) => {
    let topic = ctx.query.topic
    return ctx.render('topic/edit', {
      action: 'edit',
      topic_id: topic._id,
      title: topic.title,
      content: topic.content,
      tab: topic.tab
    })
  },
  lock: (ctx) => {
    let topic = ctx.query.topic
    let referer = ctx.get('referer')

    topic.lock = !topic.lock

    return Promise.all([
      Topic.update(
        { _id: topic._id },
        { lock: topic.lock }
      ),
      ctx.render('notify/notify', { success: topic.lock ? '此话题已锁定。' : '此话题已取消锁定。', referer: referer })
    ])
  },
  delete: async (ctx) => {
    let topic = ctx.query.topic
    let author = ctx.session.user

    author.score -= 5
    author.topic_count -= 1
    await Promise.all([
      User.update(
        { _id: author._id },
        { score: author.score, topic_count: author.topic_count }
      ),
      Topic.update(
        { _id: topic._id },
        { deleted: true }
      )
    ])

    ctx.send({ success: true, message: '话题已被删除。' })
  },
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
        return ctx.redirect(`/topic/${topic._id}`)
      }
    )
  },
  update: async (ctx) => {
    let topic = ctx.query.topic

    await Topic.update(
      { _id: topic._id },
      { title: topic.title, tab: topic.tab, content: topic.content, update_at: new Date() }
    )

    at.sendMessageToMentionUsers(topic.content, topic._id, ctx.session.user._id)
    return ctx.redirect(`/topic/${topic._id}`)
  },
  collect: async (ctx) => {
    let topic = ctx.query.topic
    let user = ctx.session.user

    await TopicCollect.newAndSave(user._id, topic._id)

    user.collect_topic_count += 1
    topic.collect_count += 1
    // 可异步处理
    await Promise.all([
      User.update(
        { _id: user._id },
        { collect_topic_count: user.collect_topic_count }
      ),
      Topic.update(
        { _id: topic._id },
        { collect_count: topic.collect_count }
      )
    ])
    return ctx.send({ status: 'success' })
  },
  de_collect: async (ctx) => {
    let topic = ctx.query.topic
    let user = ctx.session.user

    await TopicCollect.remove(user._id, topic._id)

    user.collect_topic_count -= 1
    topic.collect_count -= 1
    // 可异步处理
    await Promise.all([
      User.update(
        { _id: user._id },
        { collect_topic_count: user.collect_topic_count }
      ),
      Topic.update(
        { _id: topic._id },
        { collect_count: topic.collect_count }
      )
    ])
    ctx.send({ status: 'success' })
  },
  upload: (ctx) => {
    // TODO: 尝试弄成Promise的形式
    return new Promise((resolve, reject) => {
      let isFileLimit = false
      ctx.busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
        file.on('limit', () => {
          isFileLimit = true
          ctx.send({ success: false, msg: `File size too large. Max is ${fileLimit}` })
          resolve()
        })

        let { url } = await store.upload(file, { filename: filename })
        if (isFileLimit) {
          return
        }

        ctx.send({ success: true, url: url })
        resolve()
      })

      ctx.req.pipe(ctx.busboy)
    })
  }
}
