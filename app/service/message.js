'use strict'

const { Message } = require('../model')

module.exports = {
  /**
   * 根据用户ID，获取未读消息的数量
   * @param {String} id 用户ID
   */
  getCountById: (id) => {
    return Message.count({ master_id: id, has_read: false })
  },
  /**
   * 根据消息Id获取消息
   * @param {String} id 消息ID
   */
  getById: (id) => { },
  getRelations: (message) => { },
  /**
   * 根据用户ID，获取已读消息列表
   * @param {String} userId 用户ID
   */
  findReadByUserId: (userId) => {
    return Message.find(
      { master_id: userId, has_read: true },
      null,
      { sort: '-create_at', limit: 20 }
    )
  },
  /**
   * 根据用户ID，获取未读消息列表
   * @param {String} userId 用户ID
   */
  findUnreadByUserId: (userId) => {
    return Message.find(
      { master_id: userId, has_read: false },
      null,
      { sort: '-create_at' }
    )
  },
  /**
   * 将消息设置成已读
   */
  updateMessagesToRead: (userId, messages) => {
    if (messages.length === 0) return

    return Message.update(
      { master_id: userId, _id: { $in: messages.map((m) => { return m._id }) } },
      { $set: { has_read: true } },
      { multi: true }
    )
  }
}
