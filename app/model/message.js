'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const BaseModel = require('./base_model.js')
/*
 * type:
 *  reply: xx回复了你的话题
 *  reply2: xx在话题中回复了你
 *  follow: xx关注了你
 *  at: xx@了你
 */

let MessageSchema = new Schema({
  type: { type: String },
  master_id: { type: ObjectId },
  author_id: { type: ObjectId },
  topic_id: { type: ObjectId },
  reply_id: { type: ObjectId },
  has_read: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
})

MessageSchema.plugin(BaseModel)
MessageSchema.index({ master_id: 1, has_read: -1, create_at: -1 })

module.exports = mongoose.model('Message', MessageSchema)
