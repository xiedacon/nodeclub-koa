'use strict'

const Message = require('../model').Message;

module.exports = {
  /**
   * 根据用户ID，获取未读消息的数量
   * @param {String} id 用户ID
   */
  getCountById: (id) => {
    return Message.count({
      master_id: id,
      has_read: false
    });
  },
  /**
   * 根据消息Id获取消息
   * @param {String} id 消息ID
   */
  getById: (id) => {},
  getRelations: (message) => {},
  /**
   * 根据用户ID，获取已读消息列表
   * @param {String} userId 用户ID
   */
  findByUserId_read: (userId) => {},
  /**
   * 根据用户ID，获取未读消息列表
   * @param {String} userId 用户ID
   */
  findByUserId_unread: (userId) => {},
  /**
   * 将消息设置成已读
   */
  updateMessagesToRead: (userId, messages) => {}
};
