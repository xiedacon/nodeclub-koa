'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

let UserSchema = new Schema({
  name: {type: String},
  loginname: {type: String},
  pass: {type: String},
  email: {type: String},
  url: {type: String},
  profile_image_url: {type: String},
  location: {type: String},
  signature: {type: String},
  profile: {type: String},
  weibo: {type: String},
  avatar: {type: String},
  githubId: {type: String},
  githubUsername: {type: String},
  githubAccessToken: {type: String},
  is_block: {type: Boolean, default: false},

  score: {type: Number, default: 0},
  topic_count: {type: Number, default: 0},
  reply_count: {type: Number, default: 0},
  follower_count: {type: Number, default: 0},
  following_count: {type: Number, default: 0},
  collect_tag_count: {type: Number, default: 0},
  collect_topic_count: {type: Number, default: 0},
  create_at: {type: Date, default: Date.now},
  update_at: {type: Date, default: Date.now},
  is_star: {type: Boolean},
  level: {type: String},
  active: {type: Boolean, default: false},

  receive_reply_mail: {type: Boolean, default: false},
  receive_at_mail: {type: Boolean, default: false},
  from_wp: {type: Boolean},

  retrieve_time: {type: Number},
  retrieve_key: {type: String},

  accessToken: {type: String}
});
