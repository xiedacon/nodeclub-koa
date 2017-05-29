'use strict'

const at = require('../../app/common/at.js')
const Message = require('../../app/common/message.js')
const { User } = require('../../app/service')
const { helper } = require('../support.js')
const mm = require('mm')
const assert = require('power-assert')

describe('test/common/at.test.js', function () {
  let text =
    `@A-aZ-z0-9_
    @中文
      @begin_with_spaces @multi_in_oneline
    Text More Text @around_text ![Pic](/public/images/cnode_icon_32.png)
    @end_with_no_space中文
    Text 中文@begin_with_no_spaces
    @end_with_no_space2@begin_with_no_spaces2

    jysperm@gmail.com @alsotang

    @alsotang2

    \`\`\`
    呵呵 \`\`\`
    @alsotang3
    \`\`\`

    \`\`\`js
      @flow
    \`\`\`

    \`\`\`@alsotang4\`\`\`

    @
    @@

    \`@code_begin_with_no_space\`
    code: \`@in_code\`

    \`\`\`
    @in_oneline_pre
    \`\`\`

    \`\`\`
      Some Code
      Code @in_multi_line_pre
    \`\`\`

    [@be_link](/user/be_link) [@be_link2](/user/be_link2)

    @alsotang @alsotang
    aldjf
    @alsotang @tangzhanli

    [@alsotang](/user/alsotang)

    @liveinjs 没事儿，能力和热情更重要，北京雍和宫，想的就邮件给我i5ting@126.com`
  let users = ['A-aZ-z0-9_', 'begin_with_spaces',
    'multi_in_oneline', 'around_text', 'end_with_no_space',
    'begin_with_no_spaces', 'end_with_no_space2',
    'begin_with_no_spaces2', 'alsotang', 'alsotang2',
    'tangzhanli', 'liveinjs']
  let linkedText =
    `[@A-aZ-z0-9_](/user/A-aZ-z0-9_)
    @中文
      [@begin_with_spaces](/user/begin_with_spaces) [@multi_in_oneline](/user/multi_in_oneline)
    Text More Text [@around_text](/user/around_text) ![Pic](/public/images/cnode_icon_32.png)
    [@end_with_no_space](/user/end_with_no_space)中文
    Text 中文[@begin_with_no_spaces](/user/begin_with_no_spaces)
    [@end_with_no_space2](/user/end_with_no_space2)[@begin_with_no_spaces2](/user/begin_with_no_spaces2)

    jysperm@gmail.com [@alsotang](/user/alsotang)

    [@alsotang2](/user/alsotang2)

    \`\`\`
    呵呵 \`\`\`
    @alsotang3
    \`\`\`

    \`\`\`js
      @flow
    \`\`\`

    \`\`\`@alsotang4\`\`\`

    @
    @@

    \`@code_begin_with_no_space\`
    code: \`@in_code\`

    \`\`\`
    @in_oneline_pre
    \`\`\`

    \`\`\`
      Some Code
      Code @in_multi_line_pre
    \`\`\`

    [@be_link](/user/be_link) [@be_link2](/user/be_link2)

    [@alsotang](/user/alsotang) [@alsotang](/user/alsotang)
    aldjf
    [@alsotang](/user/alsotang) [@tangzhanli](/user/tangzhanli)

    [@alsotang](/user/alsotang)

    [@liveinjs](/user/liveinjs) 没事儿，能力和热情更重要，北京雍和宫，想的就邮件给我i5ting@126.com`
  describe('#linkUsers', function () {
    it('should link all mention users', function () {
      let _linkedText = at.linkUsers(text)
      assert(helper.includes(_linkedText, linkedText))
    })
  })

  describe('#fetchUsers', function () {
    it('should return empty array when text not exist', function () {
      assert(helper.includes(at.fetchUsers(), []))
    })
    it('should return user array', function () {
      assert(helper.includes(at.fetchUsers(text), users))
    })
  })

  describe('#sendMessageToMentionUsers', function () {
    afterEach(function () {
      mm.restore()
    })

    let _users = []
    let _authorId = 'authorId'
    let _topicId = 'topicId'
    let _replyId = 'replyId'

    it('should send message to all mention users', async function () {
      mm(Message, 'sendAtMessage', (userId, authorId, topicId, replyId) => {
        _users.push(userId)
        assert(
          (authorId === _authorId) &&
          (topicId === _topicId) &&
          (replyId === _replyId)
        )
      })
      mm(User, 'findByNames', (names) => {
        return names.map((name) => { return { _id: name } })
      })

      await at.sendMessageToMentionUsers(text, _topicId, _authorId, _replyId)
      assert(_users.toString() === users.toString())
    })

    it('should not send message to no mention users', function () {
      mm(Message, 'sendAtMessage', (userId, authorId, topicId, replyId) => {
        throw new Error('should not call this')
      })
      mm(User, 'findByNames', (names) => {
        return names.map((name) => { return { _id: name } })
      })

      return at.sendMessageToMentionUsers('aaaa')
    })

    it('should not send message to author', function () {
      mm(Message, 'sendAtMessage', (userId, authorId, topicId, replyId) => {
        throw new Error('should not call this')
      })
      mm(User, 'findByNames', (names) => {
        return names.map((name) => { return { _id: name } })
      })

      return at.sendMessageToMentionUsers('aaaa')
    })
  })
})
