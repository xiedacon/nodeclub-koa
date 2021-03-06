'use strict'
/**
 * config
 */

const path = require('path')

module.exports = {
  // debug 为 true 时，用于本地调试
  debug: false,
  logger: {
    appenders: [
      { type: 'console' },
      { type: 'file', filename: path.join(__dirname, '../logs/cheese.log'), category: 'cheese' }
    ]
  },
  // redis 配置，默认是本地
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 0
  },
  // mongodb 配置
  db: {
    uri: 'mongodb://127.0.0.1/node_club_koa_test',
    options: { poolSize: 20 }
  },
  viewPath: path.join(__dirname, '../app/view'),
  staticPath: path.join(__dirname, '../app/public'),
  // assets = require('./assets.json');
  assets: {},

  host: 'localhost', // 社区的域名
  port: 3000, // 程序运行的端口

  session: {
    secret: 'node_club_secret' // 务必修改
  },
  cookie: {
    name: 'node_club',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30,
    signed: true,
    httpOnly: true
  },

  // admin 可删除话题，编辑标签。在 names 中加上你的登录名
  admin: {
    names: ['you loginname']
  },

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
      ['/about', '关于']
    ],
    list_topic_count: 20, // 话题列表显示的话题数量
    // 版块
    tabs: [
      ['all', '全部'],
      ['good', '精华'],
      ['share', '分享'],
      ['ask', '回答'],
      ['job', '招聘']
    ],

    // 运行环境
    env: 'development',
    // cdn host，如 http://cnodejs.qiniudn.com
    static_host: '', // 静态文件存储域名
    // 默认的Google tracker ID，自有站点请修改，申请地址：http://www.google.com/analytics/
    google_tracker_id: '',
    // 默认的cnzz tracker ID，自有站点请修改
    cnzz_tracker_id: ''
  },

  // RSS配置
  rss: {
    title: 'CNode：Node.js专业中文社区',
    link: 'http://cnodejs.org',
    language: 'zh-cn',
    description: 'CNode：Node.js专业中文社区',
    // 最多获取的RSS Item数量
    max_rss_items: 50
  },

  // 邮箱配置
  email: {
    host: 'smtp.163.com',
    port: 25,
    auth: {
      user: 'nodeclub@163.com',
      pass: 'nodeclub'
    },
    ignoreTLS: true
  },

  oauth: {
    weibo: {
      // weibo app key
      key: 10000000,
      id: 'your_weibo_id'
    },
    // github 登陆的配置
    github: {
      clientID: 'your GITHUB_CLIENT_ID',
      clientSecret: 'your GITHUB_CLIENT_SECRET',
      callbackURL: 'http://cnodejs.org/auth/github/callback'
    }
  },

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
      uploadURL: 'http://xxxxxxxx'
    },
    // 注：如果填写 qn_access，则会上传到 7牛，以下配置无效
    path: path.join(__dirname, '../app/public/upload/'),
    url: '/public/upload/'
  },

  // 极光推送
  jpush: {
    appKey: 'YourAccessKeyyyyyyyyyyyy',
    masterSecret: 'YourSecretKeyyyyyyyyyyyyy',
    isDebug: false
  },

  create_post_per_day: 1000, // 每个用户一天可以发的主题数
  create_reply_per_day: 1000, // 每个用户一天可以发的评论数
  create_user_per_ip: 1000,
  visit_per_day: 1000 // 每个 ip 每天能访问的次数
}
