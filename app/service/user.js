'use strict'
const User = require('../model').User;
const uuid = require('uuid');
const crypto = require('crypto');

module.exports = {
  /**
   * 根据用户名列表查找用户列表
   * @param {Array} names 用户名列表
   */
  findByNames: (names) => {

  },
  /**
   * 根据登录名查找用户
   * @param {String} loginName 登录名
   */
  getByLoginName: (loginName) => {

  },
  /**
   * 根据用户ID，查找用户
   * @param {String} id 用户ID
   */
  getById: (id) => {

  },
  /**
   * 根据邮箱，查找用户
   * @param {String} email 邮箱地址
   */
  getByMail: (email) => {

  },
  /**
   * 根据用户ID列表，获取一组用户
   * @param {Array} ids 用户ID列表
   */
  findByIds: (ids) => {

  },
  /**
   * 根据关键字，获取一组用户
   * @param {String} query 关键字
   * @param {Object} opt 选项
   */
  findByQuery: (query, opt) => {
    return User.find(query, {}, opt);
  },
  /**
   * 根据查询条件，获取一个用户
   * @param {String} name 用户名
   * @param {String} key 激活码
   */
  getByNameAndKey: (loginname, key) => {

  },
  /**
   * 保存用户
   * @param {String} name
   * @param {String} loginname
   * @param {String} pass
   * @param {String} email
   * @param {String} avatar_url
   * @param {Boolean} active
   */
  newAndSave: (name, loginname, pass, email, avatar_url, active) => {

  },
  makeGravatar: makeGravatar,
  getGravatar: (user) => {
    return user.avatar || makeGravatar(user.email);
  }
};
function makeGravatar(email){
  return `http://www.gravatar.com/avatar/${crypto.createHash('md5').update(email.toLowerCase()).digest('hex')}?size=48`;
}
