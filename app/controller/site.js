'use strict'

module.exports = {
  index: (ctx, next) => {
    let page = parseInt(ctx.request.query.page, 10) || 1;
    page = page > 0 ? page : 1;

    Topic.getTopicsByQuery()

    // 取排行榜上的用户
    cache.get('tops')
    // END 取排行榜上的用户

    // 取0回复的主题
    cache.get('no_reply_topics')
    // END 取0回复的主题

    // 取分页数据
    cache.get('')
    // END 取分页数据

    ctx.render('index', {
      topics: topics,
      current_page: page,
      list_topic_count: limit,
      tops: tops,
      no_reply_topics: no_reply_topics,
      pages: pages,
      tabs: config.tabs,
      tab: tab,
      pageTitle: tabName && (tabName + '版块')
    });
  }
};
