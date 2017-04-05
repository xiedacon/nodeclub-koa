'use strict'
/**
 * config
 */

const path = require('path');
const log4js = require('log4js');
const redis = require('koa-redis');
const mongoose = require('mongoose');
const Promiss = require('bluebird');
Promiss.promisifyAll(redis);
Promiss.promisifyAll(mongoose);

// debug 为 true 时，用于本地调试
let debug = true;

log4js.configure({
  appenders: [
    {type: 'console'},
    {type: 'file', filename: path.join(__dirname,'../logs/cheese.log'), category: 'cheese'}
  ]
});
let logger = log4js.getLogger('cheese');
logger.setLevel(debug ? 'DEBUG' : 'ERROR');

// mongodb 配置
let db = {
  uri: 'mongodb://127.0.0.1/node_club_dev',
  options: {
    poolSize: 20
  }
};
mongoose.connect(db.uri, db.options, (err) => {
  if(err){
    config.logger.error('connect to %s error: ', db.uri, err.message);
    process.exit(1);
  }
});

// redis 配置，默认是本地
let redis_config = {
  redis_host: '127.0.0.1',
  redis_port: 6379,
  redis_db: 0,
  redis_password: ''
};
let redisClient = redis(redis_config);
redisClient.on('error', (err) => {
  if(err){
    logger.error('connect to redis error, check your redis config', err);
    process.exit(1);
  }
});

module.exports = {
  logger: logger,
  redisClient: redisClient,

  mini_assets: !debug, // 是否启用静态文件的合并压缩，详见视图中的Loader

  host: 'localhost', // 社区的域名
  port: 3000, // 程序运行的端口
  // cdn host，如 http://cnodejs.qiniudn.com
  static_host: '', // 静态文件存储域名
  session_secret: 'node_club_secret', // 务必修改
  auth_cookie_name: 'node_club',
  // admin 可删除话题，编辑标签。把 user_login_name 换成你的登录名
  admins: { user_login_name: true },

  // 默认的Google tracker ID，自有站点请修改，申请地址：http://www.google.com/analytics/
  google_tracker_id: '',
  // 默认的cnzz tracker ID，自有站点请修改
  cnzz_tracker_id: '',

  site: {
    name: 'Nodeclub', // 社区名字
    description: 'CNode：Node.js专业中文社区', // 社区的描述
    keywords: 'nodejs, node, express, connect, socket.io',

    // 添加到 html head 中的信息
    headers: ['<meta name="author" content="EDP@TAOBAO" />'],
    logo: '/public/images/cnodejs_light.svg', // default is `name`
    icon: '/public/images/cnode_icon_32.png', // 默认没有 favicon, 这里填写网址
    // 右上角的导航区
    navs: [
      // 格式 [ path, title, [target=''] ]
      [ '/about', '关于' ]
    ],
    list_topic_count: 20, // 话题列表显示的话题数量
    // 版块
    tabs: [
      ['share', '分享'],
      ['ask', '问答'],
      ['job', '招聘'],
    ]
  },

  // RSS配置
  rss: {
    title: 'CNode：Node.js专业中文社区',
    link: 'http://cnodejs.org',
    language: 'zh-cn',
    description: 'CNode：Node.js专业中文社区',
    //最多获取的RSS Item数量
    max_rss_items: 50
  },

  // 邮箱配置
  mail_opts: {
    host: 'smtp.126.com',
    port: 25,
    auth: {
      user: 'club@126.com',
      pass: 'club'
    },
    ignoreTLS: true,
  },

  oauth: {
    weibo: {
      //weibo app key
      key: 10000000,
      id: 'your_weibo_id'
    },
    // github 登陆的配置
    github: {
      clientID: 'your GITHUB_CLIENT_ID',
      clientSecret: 'your GITHUB_CLIENT_SECRET',
      callbackURL: 'http://cnodejs.org/auth/github/callback'
    }
  }

  // 是否允许直接注册（否则只能走 github 的方式）
  allow_sign_up: true,

  // oneapm 是个用来监控网站性能的服务
  oneapm_key: '',

  // 文件上传配置
  upload: {
    file_limit: '1MB',
    // 7牛的access信息
    qn_access: {
      accessKey: 'your access key',
      secretKey: 'your secret key',
      bucket: 'your bucket name',
      origin: 'http://your qiniu domain',
      // 如果vps在国外，请使用 http://up.qiniug.com/ ，这是七牛的国际节点
      // 如果在国内，此项请留空
      uploadURL: 'http://xxxxxxxx',
    },
    // 注：如果填写 qn_access，则会上传到 7牛，以下配置无效
    path: path.join(__dirname, 'public/upload/'),
    url: '/public/upload/'
  },

  // 极光推送
  jpush: {
    appKey: 'YourAccessKeyyyyyyyyyyyy',
    masterSecret: 'YourSecretKeyyyyyyyyyyyyy',
    isDebug: false,
  },

  create_post_per_day: 1000, // 每个用户一天可以发的主题数
  create_reply_per_day: 1000, // 每个用户一天可以发的评论数
  create_user_per_ip: 1000,
  visit_per_day: 1000, // 每个 ip 每天能访问的次数
};
