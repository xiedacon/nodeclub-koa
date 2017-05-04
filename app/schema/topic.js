'use strict'
const helper = require('./helper.js')
const validator = require('validator')

const config = require('config-lite')
const tabs = config.site.tabs

module.exports = {
  create: (ctx, next) => {
    if (!helper.userRequired(ctx)) return
    return next()
  },
  put: async (ctx, next) => {
    if (!helper.userRequired(ctx) || !(await helper.peruserperday(ctx, 'create_topic', config.create_post_per_day, {
      showJson: false
    }))) return

    let title = validator.trim(ctx.request.body.title)
    let tab = validator.trim(ctx.request.body.tab)
    let content = validator.trim(ctx.request.body.t_content)
    let error =
      (title === '' && '标题不能是空的。') ||
      ((title.length < 5 || title.length > 100) && '标题字数太多或太少。') ||
      ((!tab || tabs.find((pair) => { return tab === pair[0] }) < 0) && '必须选择一个版块。') ||
      ((content === '') && '内容不可为空')
    if (error) {
      return ctx.renderError({
        edit_error: error,
        title: title,
        content: content
      }, 422, 'topic/edit')
    }

    Object.assign(ctx.query, {
      title: title,
      tab: tab,
      content: content
    })

    return next()
  },
  index: (ctx, next) => {
    let topicId = ctx.params.tid

    if (topicId.length !== 24) return ctx.renderError('此话题不存在或已被删除。', 404)

    return next()
  }
}
