'use strict'
const Promiss = require('bluebird');
const Topic = require('../model').Topic;
const User = require('./user.js');
const Reply = require('./reply.js');

module.exports = {
  /**
   * 根据主题ID获取主题
   * @param {String} id 主题ID
   */
  getTopicById: (id) => {
    return Topic.findOneAsync({_id: id})
      .then((topic) => {
        if(!topic) return;

        let promisses = [User.getUserById(topic.author_id)];
        if(topic.last_reply){
          promisses.push(Reply.getReplyById(topic.last_reply));
        }
        promisses.push((author, last_reply) => {
          topic.author = author;
          topic.last_reply = last_reply;
        });
        return Promiss.join.apply({}, promisses);
      });
  },
  /**
   * 获取关键词能搜索到的主题数量
   * @param {String} query 搜索关键词
   */
  getCountByQuery: (query) => {
    return Topic.countAsync(query);
  },
  /**
   * 根据关键词，获取主题列表
   * @param {String} query 搜索关键词
   * @param {Object} opt 搜索选项
   */
  getTopicsByQuery: (query, opt) => {
    query.deleted = false;
    return Topic.findAync(query, {}, opt)
      .map((topic) => {
        return Promiss.join(
          User.getUserById(topic.author_id),
          Reply.getReplyById(topic.last_reply),
          (user, reply) => {
            if(author){
              topic.author = author;
              topic.reply = reply;
            }else{
              topic[i] == null;
            }
          }
        );
      })
      .filter((topic) => {
        return topic;
      });
      // .catch(() => {
      //   ?
      // });
  },
  // for sitemap
  getLimit5w: () => {
    return Topic.findAsync({deleted: false}, '_id', {limit: 50000, sort: '-create_at'});
  },
  /**
   * 获取所有信息的主题
   * @param {String} id 主题ID
   */
  getFullTopic: (id) => {
    return Topic.findOneAsync({_id: id, deleted: false})
      .then((topic) => {
        if(!topic) return;

        return Promiss.join(
          at.linkUsers(topic.content),
          User.getUserById(topic.author_id),
          Reply.getRepliesByTopicId(topic._id),
          (str, author, replies) => {
            topic.linkedContent = str;
            topic.author = author;
            topic.replies = replies;
          }
        );
      });
  },
  /**
   * 更新主题的最后回复信息
   * @param {String} topicId 主题ID
   * @param {String} replyId 回复ID
   */
  updateLastReply: (topicId, replyId) => {
    return Topic.findOneAsync({_id: topicId})
      .then((topic) => {
        if(!topic) return;

        topic.last_reply = replyId;
        topic.last_reply_at = new Date();
        topic.reply_count += 1;
        return topic.saveAsync();
      });
  },
  /**
   * 将当前主题的回复计数减1，并且更新最后回复的用户，删除回复时用到
   * @param {String} id 主题ID
   */
  reduceCount: (id) => {
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
