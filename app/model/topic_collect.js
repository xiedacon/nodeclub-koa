'sue strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const BaseModel = require('./base_model.js');

let TopicCollectSchema = new Schema({
  user_id: {type: ObjectId},
  topic_id: {type: ObjectId},
  create_at: {type: Date, default: Date.now}
});

TopicCollectSchema.plugin(BaseModel);
TopicCollectSchema.index({user_id: 1, topic_id: 1}, {unique: true});

module.exports = mongoose.model('TopicCollect', TopicCollectSchema);
