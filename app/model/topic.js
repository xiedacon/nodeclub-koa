'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const tabs = require('config-lite').site.tabs
const BaseModel = require('./base_model.js')

let TopicSchema = new Schema({
  title: { type: String },
  content: { type: String },
  author_id: { type: ObjectId },
  top: { type: Boolean, default: false }, // 置顶帖
  good: { type: Boolean, default: false }, // 精华帖
  lock: { type: Boolean, default: false }, // 被锁定主题
  reply_count: { type: Number, default: 0 },
  visit_count: { type: Number, default: 0 },
  collect_count: { type: Number, default: 0 },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  last_reply: { type: ObjectId },
  last_reply_at: { type: Date, default: Date.now },
  content_is_html: { type: Boolean },
  tab: { type: String },
  deleted: { type: Boolean, default: false }
})

TopicSchema.index({ create_at: -1 })
TopicSchema.index({ top: -1, last_reply_at: -1 })
TopicSchema.index({ author_id: 1, create_at: -1 })

TopicSchema.plugin(BaseModel)
TopicSchema.virtual('tabName').get(function () {
  let tab = this.tab
  let pair = tabs.find((_pair) => {
    return _pair[0] === tab
  })

  return pair ? pair[1] : ''
})
TopicSchema.pre('find', function (next) {
  if (typeof this._conditions.deleted === 'undefined') this._conditions.deleted = false
  if (typeof this.options.sort === 'undefined') this.options.sort = { top: -1, last_reply_at: -1 }
  next()
})
TopicSchema.pre('findOne', function (next) {
  if (typeof this._conditions.deleted === 'undefined') this._conditions.deleted = false
  next()
})

module.exports = mongoose.model('Topic', TopicSchema)
