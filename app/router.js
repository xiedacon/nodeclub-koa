'use strict'
const api_router = require('./api_router_v1.js');
const mount = require('koa-mount');
const router = require('koa-router');
const config = require('config-lite');

const site = require('./controller/site.js');
const sign = require('./controller/sign.js');
const user = require('./controller/user.js');
const message = require('./controller/message.js');
const topic = require('./controller/topic.js');
const reply = require('./controller/reply.js');
const rss = require('./controller/rss');
const static = require('./controller/static');
const github = require('./controller/github');
const search = require('./controller/search');

// site
// home page
router.get('/', site.index);
// sitemap
router.get('/sitemap.xml', site.sitemap);
// mobile app download
router.get('/app/download', site.appDownload);

//sign
if(config.allow_sign_up){
  router.get('/signup', sign.showSignup);  // 跳转到注册页面
  router.post('/signup', sign.signup);  // 提交注册信息
}else{
  // 进行github验证
  router.get('/signup', function (ctx, next) {
    ctx.redirect('/auth/github');
  });
}
