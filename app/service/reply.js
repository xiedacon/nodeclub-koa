'use strict'
const { Reply, Topic } = require('../model')

module.exports = {
  /**
   * 获取一条回复信息
   * @param {String} id 回复ID
   */
  getById: (id) => {
    return Reply.findOne({ _id: id })
  },
  /**
   * 根据主题ID，获取回复列表
   * @param {String} id 主题ID
   */
  findByTopicId: (topicId) => {
    return Reply.find({ topic_id: topicId })
  },
  /**
   * 创建并保存一条回复信息
   * @param {String} content 回复内容
   * @param {String} topicId 主题ID
   * @param {String} authorId 回复作者
   * @param {String} [replyId] 回复ID，当二级回复时设定该值
   */
  newAndSave: (content, topicId, authorId, replyId) => {
    return new Reply({
      content: content,
      topic_id: topicId,
      author_id: authorId,
      reply_id: replyId
    }).save()
  },
  /**
   * 根据topicId查询到最新的一条未删除回复
   * @param topicId 主题ID
   */
  getLastReplyByTopId: (topicId) => {
    return Reply.findOne({ topic_id: topicId })
  },
  update: (con, doc, opt) => {
    return Reply.update(con, { $set: doc }, opt)
  },
  updateRaw: (con, doc, opt) => {
    return Reply.update(con, doc, opt)
  },
  findByAuthorId: (authorId) => {
    return Reply.find(
      { author_id: authorId }
    )
  },
  getCountByQuery: (query) => {
    return Topic.count(query)
  }
}
