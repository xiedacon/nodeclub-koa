'use strict'

const Message = require('./message.js')
const { User } = require('../service')

module.exports = exports = {
  /**
   * 根据文本内容，替换为数据库中的数据
   * @param {String} text 文本内容
   */
  linkUsers: (text) => {
    let users = exports.fetchUsers(text)
    users.forEach((name) => {
      text = text.replace(new RegExp(`@${name}\\b(?!\\])`, 'g'), `[@${name}](/user/${name})`)
    })
    return text
  },
  /**
   * 从文本中提取出@username 标记的用户名数组
   * @param {String} text 文本内容
   * @return {Array} 用户名数组
   */
  fetchUsers: (text) => {
    if (!text) return []

    let ignoreRegexs = [
      /```.+?```/g, // 去除单行的 ```
      /^```[\s\S]+?^```/gm, // ``` 里面的是 pre 标签内容
      /`[\s\S]+?`/g, // 同一行中，`some code` 中内容也不该被解析
      /^ {4}.*/gm, // 4个空格也是 pre 标签，在这里 . 不会匹配换行
      /\b\S*?@[^\s]*?\..+?\b/g, // somebody@gmail.com 会被去除
      /\[@.+?\]\(\/.+?\)/g // 已经被 link 的 username
    ]

    ignoreRegexs.forEach((ignoreRegex) => {
      text = text.replace(ignoreRegex, '')
    })

    let results = text.match(/@[a-z0-9\-_]+\b/igm)
    let names = []
    if (results) {
      let _names = results.map((result) => {
        // remove leading char @
        return result.slice(1)
      })

      _names.forEach((name) => {
        if (names.indexOf(name) < 0) names.push(name)
      })
    }

    return names
  },
  /**
   * 根据文本内容中读取用户，并发送消息给提到的用户
   * @param {String} text 文本内容
   * @param {String} topicId 主题ID
   * @param {String} authorId 作者ID
   * @param {String} reply_id 回复ID
   */
  sendMessageToMentionUsers: async (text, topicId, authorId, replyId) => {
    let users = await User.findByNames(exports.fetchUsers(text))

    if (!users) return
    return Promise.map(users.filter((user) => {
      return !user._id.equals(authorId)
    }), (user) => {
      return Message.sendAtMessage(user._id, authorId, topicId, replyId)
    })
  }
}
