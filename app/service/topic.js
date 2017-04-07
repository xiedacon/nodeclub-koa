'use strict'
const Topic = require('../model').Topic;
const User = require('./user.js');
const Reply = require('./reply.js');

module.exports = {
  /**
   * 根据主题ID获取主题
   * @param {String} id 主题ID
   */
  getTopicById: (id) => {
    return Topic.findOne({_id: id});
  },
  /**
   * 获取关键词能搜索到的主题数量
   * @param {String} query 搜索关键词
   */
  getCountByQuery: (query) => {
    return Topic.count(query);
  },
  /**
   * 根据关键词，获取主题列表
   * @param {String} query 搜索关键词
   * @param {Object} opt 搜索选项
   */
  getTopicsByQuery: (query, opt) => {
    query.deleted = false;
    return Topic.find(query, {}, opt);
  },
  // for sitemap
  getLimit5w: () => {
    return Topic.find({deleted: false}, '_id', {limit: 50000, sort: '-create_at'});
  },
  /**
   * 更新主题的最后回复信息
   * @param {String} topicId 主题ID
   * @param {String} replyId 回复ID
   */
  updateLastReply: async (topicId, replyId) => {
    let topic = await Topic.findOne({_id: topicId});
    topic.last_reply = replyId;
    topic.last_reply_at = new Date();
    topic.reply_count += 1;
    await topic.save();
  },
  /**
   * 将当前主题的回复计数减1，并且更新最后回复的用户，删除回复时用到
   * @param {String} id 主题ID
   */
  reduceCount: async (id) => {
    let topic = await Topic.findOne({_id: id});
    topic.reply_count -= 1;
    let reply = await Reply.getLastReplyByTopId(id);
    

    return Topic.findOneAsync({_id: id})
      .then((topic) => {
        if(!topic) return;

        topic.reply_count -= 1;
        return Reply.getLastReplyByTopId(id)
          .then((reply) => {
            topic.last_reply = reply.length === 0 ? null : reply[0]._id;
            return topic.saveAsync();
          });
      });
  },
  newAndSave: (title, content, tab, authorId) => {
    return new Topic({
      title: title,
      content: content,
      tab: tab,
      author_id: authorId
    }).saveAsync();
  }
};
