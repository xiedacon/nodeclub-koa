'use strict'

const Router = require('koa-router')
const config = require('config-lite')
const passport = require('koa-passport')

const site = require('./controller/site.js')
const sign = require('./controller/sign.js')
const user = require('./controller/user.js')
const message = require('./controller/message.js')
const topic = require('./controller/topic.js')
const reply = require('./controller/reply.js')
const rss = require('./controller/rss.js')
const staticController = require('./controller/static.js')
const github = require('./controller/github.js')
const search = require('./controller/search.js')

const schema = require('./schema')

const router = new Router()

// require('./api_router.js')

// site
// home page
router.get('/', site.index)
// sitemap
router.get('/sitemap.xml', site.sitemap)
// mobile app download
router.get('/app/download', site.appDownload)

// sign
if (config.allow_sign_up) {
  router.get('/signup', sign.showSignup) // 跳转到注册页面
  router.post('/signup', schema.sign.signup, sign.signup) // 提交注册信息
} else {
  // 进行github验证
  router.get('/signup', (ctx) => {
    ctx.redirect('/auth/github')
  })
}
router.post('/signout', sign.signout) // 登出
router.get('/signin', sign.showLogin) // 进入登录页面
router.post('/signin', schema.sign.login, sign.login) // 登录校验
router.get('/active_account', sign.activeAccount) // 帐号激活
router.get('/search_pass', sign.showSearchPass) // 找回密码页面
router.post('/search_pass', sign.updateSearchPass) // 更新密码
router.get('/reset_pass', sign.resetPass) // 进入重置密码页面
router.post('/reset_pass', sign.updatePass) // 更新密码

// user
router.get('/user/:name', user.index) // 用户个人主页
router.get('/setting', user.showSetting) // 用户个人设置页
router.post('/setting', user.setting) // 提交个人信息设置
router.get('/stars', user.listStars) // 显示所有达人列表页
router.get('/users/top100', user.top100) // 显示积分前一百用户页
router.get('/user/:name/collections', user.listCollectedTopics) // 用户收藏的所有话题页
router.get('/user/:name/topics', user.listTopics) // 用户发布的所有话题页
router.get('/user/:name/replies', user.listReplies) // 用户参与的所有回复页
router.post('/user/set_star', user.toggleStar) // 把某用户设为达人
router.post('/user/cancel_star', user.toggleStar) // 取消某用户的达人身份
router.post('/user/:name/block', user.block) // 禁言某用户
router.post('/user/:name/delete_all', user.deleteAll) // 删除某用户所有发言

// message
router.get('/my/messages', message.index) // 用户个人的所有消息页

// topic
router.get('/topic/create', schema.topic.create, topic.create) // 新建文章界面
router.post('/topic/create', schema.topic.put, topic.put) // 保存新建的文章
router.get('/topic/:tid', schema.topic.index, topic.index) // 显示某个话题
router.get('/topic/:tid/edit', schema.topic.showEdit, topic.showEdit) // 编辑某话题
router.post('/topic/:tid/edit', schema.topic.update, topic.update)
router.post('/topic/:tid/top', topic.top) // 将某话题置顶
router.post('/topic/:tid/good', topic.good) // 将某话题加精
router.post('/topic/:tid/lock', topic.lock) // 锁定主题，不能再回复
router.post('/topic/:tid/delete', topic.delete)
router.post('/topic/collect', topic.collect) // 关注某话题
router.post('/topic/de_collect', topic.de_collect) // 取消关注某话题

// reply
router.post('/:topic_id/reply', schema.reply.add, reply.add) // 提交一级回复
router.get('/reply/:reply_id/edit', schema.reply.showEdit, reply.showEdit) // 修改自己的评论页
router.post('/reply/:reply_id/edit', reply.update) // 修改某评论
router.post('/reply/:reply_id/delete', reply.delete) // 删除某评论
router.post('/reply/:reply_id/up', reply.up) // 为评论点赞
router.post('/upload', topic.upload) // 上传图片

// static
router.get('/about', staticController.about)
router.get('/faq', staticController.faq)
router.get('/getstart', staticController.getstart)
router.get('/robots.txt', staticController.robots)
router.get('/api', staticController.api)

// rss
router.get('/rss', rss.index)

// github
router.get('/auth/github', passport.authenticate('github'))
router.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/signin'
  }),
  github.callback)
router.get('/auth/github/new', github.new)
router.post('/auth/github/create', github.create)

// search
router.get('/search', search.index)

// api
// router.use('/api/v1', require('./api_router'));

module.exports = router
