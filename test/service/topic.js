'use strict'
const Topic = require('../../app/service').Topic;
const support = require('../support.js');
const assert = require('power-assert');

describe('test/service/topic.js', ()=>{
  let mockUser, mockTopic;

  before((done) => {
    support.ready().then(() => {
      return support.createUser()
        .then((user) => {
          mockUser = user;
          return support.createTopic(mockUser.id);
        })
        .then((topic) => {
          mockTopic = topic;
          return support.createReply(mockTopic.id, mockUser.id);
        })
        .then((reply) => {
          return support.createSingleUp(reply.id, user.id);
        });
    }).then(done);
  });

  describe('#getTopicById()', () => {
    if('returns should match mockTopic', (done) => {
      Topic.getTopicById(mockTopic.id)
        .then((topic) => {
          assert(mockTopic === topic);
          done();
        });
    });
  })
})
