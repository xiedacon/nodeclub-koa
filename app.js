'use strict'
const koa = require('koa');
const config = require('config-lite');
const logger = config.logger;
const views = require('koa-views');
const router = require('./app/router.js');
require('colors');

const app = new koa();

app.use(views('./app/view', {
  map: {html: 'ejs'}
}));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(require('koa-static')('./app/public'));

app.listen(config.port, () => {
  logger.info('NodeClub listening on port', config.port);
  logger.info('God bless love....');
  logger.info('You can debug your app with http://' + config.host + ':' + config.port);
  logger.info('');
});
