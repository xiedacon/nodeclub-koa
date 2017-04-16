'use strict'
global.Promise = require('bluebird');

const logger = require('./app/middleware/logger.js');
require('./app/middleware/redis.js');
require('./app/middleware/db.js');

require('colors');

const koa = require('koa');
const config = require('config-lite');
const router = require('./app/router.js');
const session = require('koa-session2');
const Store = require('./app/middleware/store.js');
const render = require('./app/middleware/render.js');
const template = require('./app/middleware/template.js');
const Loader = require('./app/middleware/loader.js');
const staticMiddle = require('./app/middleware/static/static.js');
const less = require('less');
const mount = require('koa-mount');

const app = new koa();

app.use(render(
  template(config.viewPath, '.html'), {
    config: config.site,
    Loader: Loader,
    assets: config.assets,
    staticFile: (url) => {
      return url;
    },
    proxy: (url) => {
      return url;
    }
  }
));

app.use(session({
  store: new Store()
}));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(mount('/public', staticMiddle(config.staticPath, {
  compress: true,
  extensions: {
    less: (data, ctx) => {
      return new Promise((resolve) => {
        less.render(data, (e, output) => {
          if(e) throw e;
          ctx.set('Content-Type', 'text/css; charset=utf-8');
          ctx.set('Content-Length', Buffer.byteLength(output.css));
          resolve(output.css);
        });
      })
    }
  }
})));




app.listen(config.port, () => {
  logger.info('NodeClub listening on port', config.port);
  logger.info('God bless love....');
  logger.info('You can debug your app with http://' + config.host + ':' + config.port);
  logger.info('');
});
