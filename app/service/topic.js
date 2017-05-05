'use strict'
const { Topic, Reply } = require('../model')

module.exports = {
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
  // for sitemap
  getLimit5w: () => {
    return Topic.find({}, '_id', { limit: 50000, sort: '-create_at' })
  },
  /**
   * 更新topic
   * @param {Object} con 搜索关键词
   * @param {Object} doc 需要更新的字段
   */
  update: (con, doc) => {
    return Topic.update(con, { $set: doc })
  },
  newAndSave: (title, content, tab, authorId) => {
    return new Topic({
      title: title,
      content: content,
      tab: tab,
      author_id: authorId
    }).save()
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
    let reply = (await Reply.findOne({ topic_id: id }, {}, { sort: {create_at: -1} })) || { _id: null, create_at: (await Topic.getById(id)).create_at }
    return Topic.update(
      { _id: id },
      { $inc: { reply_count: -1 }, last_reply: reply._id, last_reply_at: reply.create_at }
    )
  }
}
