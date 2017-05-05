'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const BaseModel = require('./base_model.js')

let ReplySchema = new Schema({
  content: { type: String },
  topic_id: { type: ObjectId },
  author_id: { type: ObjectId },
  reply_id: { type: ObjectId },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  content_is_html: { type: Boolean },
  ups: [ObjectId],
  deleted: { type: Boolean, default: false }
})

ReplySchema.plugin(BaseModel)
ReplySchema.index({ topic_id: 1 })
ReplySchema.index({ author_id: 1, create_at: -1 })

ReplySchema.pre('find', function (next) {
  if (typeof this._conditions.deleted === 'undefined') this._conditions.deleted = false
  if (typeof this.options.sort === 'undefined') this.options.sort = { create_at: 1 }
  next()
})

ReplySchema.pre('findOne', function (next) {
  if (typeof this._conditions.deleted === 'undefined') this._conditions.deleted = false

  next()
})

module.exports = mongoose.model('Reply', ReplySchema)
