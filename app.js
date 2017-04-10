'use strict'
const koa = require('koa');
const config = require('config-lite');
const logger = config.logger;
const views = require('koa-views');
const router = require('./app/router.js');
const session = require('koa-session2');
const Store = require('./app/middleware/store.js');

const mount = require('koa-mount');

require('colors');

const app = new koa();

app.use(views('./app/view', {
  extension: 'ejs',
  options: {
    config: config.site
  }
}));
app.use(session({
  store: new Store()
}));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(mount('/public', require('koa-static')(config.staticPath)));

app.listen(config.port, () => {
  logger.info('NodeClub listening on port', config.port);
  logger.info('God bless love....');
  logger.info('You can debug your app with http://' + config.host + ':' + config.port);
  logger.info('');
});
