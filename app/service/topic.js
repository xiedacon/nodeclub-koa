'use strict'
const { Topic, Reply, User } = require('../model')

module.exports = exports = {
  /**
   * 根据主题ID获取主题
   * @param {String} id 主题ID
   */
  getById: (id) => {
    return Topic.findOne({ _id: id })
  },
  /**
   * 获取关键词能搜索到的主题数量
   * @param {String} query 搜索关键词
   */
  getCountByQuery: (query) => {
    return Topic.count(query)
  },
  /**
   * 根据关键词，获取主题列表
   * @param {String} query 搜索关键词
   * @param {Object} opt 搜索选项
   */
  findByQuery: (query, opt) => {
    return Topic.find(query, {}, opt)
  },
  findFullTopicByQuery: (query, opt) => {
    return Promise.map(
      exports.findByQuery(query, opt),
      (topic) => {
        return Promise.join(
          User.findOne({ _id: topic.author_id }),
          (async () => {
            let reply = await Reply.findOne({ _id: topic.last_reply })
            if (!reply) return
            reply.author = await User.findOne({ _id: reply.author_id })
            return reply
          })(),
          (author, reply) => {
            // 保证顺序
            // 作者可能已被删除
            if (!author) return null

            topic.author = author
            topic.reply = reply
            return topic
          }
        )
      }).filter((topic) => { return topic !== null })
  },
  // for sitemap
  getLimit5w: () => {
    return Topic.find({}, '_id', { limit: 50000, sort: '-create_at' })
  },
  /**
   * 更新topic
   * @param {Object} con 搜索关键词
   * @param {Object} doc 需要更新的字段
   */
  update: (con, doc, opt) => {
    return Topic.update(con, { $set: doc }, opt)
  },
  newAndSave: (doc) => {
    return new Topic(doc).save()
  },
  updateLastReply: (topicId, replyId) => {
    return Topic.update(
      { _id: topicId },
      {
        $set: { last_reply: replyId, last_reply_at: new Date() },
        $inc: { reply_count: 1 }
      }
    )
  },
  reduceCount: async (id) => {
    let reply = (await Reply.findOne({ topic_id: id }, {}, { sort: { create_at: -1 } })) || { _id: null, create_at: (await Topic.findById(id)).create_at }
    return Topic.update(
      { _id: id },
      { $inc: { reply_count: -1 }, last_reply: reply._id, last_reply_at: reply.create_at }
    )
  }
}
