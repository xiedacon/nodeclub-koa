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
  newAndSave: (doc) => {
    return new Reply(doc).save()
  },
  update: (con, doc, opt) => {
    return Reply.update(con, { $set: doc }, opt)
  },
  updateRaw: (con, doc, opt) => {
    return Reply.update(con, doc, opt)
  },
  findByAuthorId: (authorId, opt) => {
    return Reply.find(
      { author_id: authorId },
      {},
      opt
    )
  },
  getCountByQuery: (query) => {
    return Topic.count(query)
  }
}
