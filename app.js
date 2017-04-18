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
const bodyparser = require('koa-bodyparser');
const auth = require('./app/middleware/auth.js');

const app = new koa();

app.keys = [config.cookie.name];
app.use(bodyparser());
app.use(session({
  key: config.session.secret,
  store: new Store()
}));

// custom middleware
app.use(auth.authUser);
app.use(auth.blockUser);

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
      // 当 google 和 github 封锁严重时，则需要通过服务器代理访问它们的静态资源
      // return '/agent?url=' + encodeURIComponent(url);
    },
    escapeSignature: function(signature) {
      return signature.split('\n').map(function(p) {
        return p;
      }).join('<br>');
    }
  }
));

app.use(router.routes());
app.use(router.allowedMethods());
app.use(mount('/public', staticMiddle(config.staticPath, {
  compress: true,
  extensions: {
    less: (data, ctx) => {
      return new Promise((resolve) => {
        less.render(data, (e, output) => {
          if (e) throw e;
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
