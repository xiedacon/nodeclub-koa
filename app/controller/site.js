'use strict'
const cache = require('../middleware/cache.js');
const Promiss = require('bluebird');
const config = require('config-lite');
const Topic = require('../service').Topic;
const User = require('../service').User;

module.exports = {
  index: async (ctx, next) => {
    let page = parseInt(ctx.request.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    let query = {};
    let tab = ctx.request.query.tab || 'all';
    if (tab === 'all') {
      query.tab = {
        $ne: 'job'
      };
    } else if (tab === 'good') {
      query.good = true;
    } else {
      query.tab = tab;
    }
    let limit = config.list_topic_count;
    let options = {
      skip: (page - 1) * limit,
      limit: limit,
      sort: '-top -last_reply_at'
    };

    await Promiss.join(
      Topic.findByQuery(query, options),
      // 取排行榜上的用户
      cache.get('tops', () => {
        return User.findByQuery({
          is_block: false
        }, {
          limit: 10,
          sort: '-score'
        });
      }, 60 * 1),
      // END 取排行榜上的用户

      // 取0回复的主题
      cache.get('no_reply_topics', () => {
        return Topic.findByQuery({
          reply_count: 0,
          tab: {
            $ne: 'job'
          }
        }, {
          limit: 5,
          sort: '-create_at'
        });
      }, 60 * 1),
      // END 取0回复的主题

      // 取分页数据
      cache.get(`${JSON.stringify(query)}pages`, async() => {
        return Math.ceil(await Topic.getCountByQuery(query) / limit);
      }, 60 * 1),
      // END 取分页数据

      (topics, tops, no_reply_topics, pages) => {
        let tabName = config.site.tabs.find((part) => {
          return part[0] === tab;
        });
        return ctx.render('index', {
          topics: topics,
          current_page: page,
          list_topic_count: limit,
          tops: tops,
          no_reply_topics: no_reply_topics,
          pages: pages,
          tab: tab,
          pageTitle: tabName && `${tabName}版块`
        });
      }
    );
    return next();
  },
  sitemap: (ctx, next) => {
    next();
  },
  appDownload: (ctx, next) => {
    next();
  }
};
