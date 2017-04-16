'use strict'
const send = require('koa-send');
const resolvePath = require('resolve-path');
const fs = require('./fs.js');
const _path = require('path');
const parse = _path.parse;
const compression = require('./compression.js')

module.exports = (root, options = {}) => {
  options.root = root;
  options.extensions = Object.assign({}, options.extensions);
  options.compress = options.compress || false;
  let compress = compression(options.compress);
  let acceptsEncodings = ['gzip', 'deflate', 'identity'];
  options.acceptsEncodings = options.acceptsEncodings ? acceptsEncodings.concat(options.acceptsEncodings) : acceptsEncodings;
  options.maxage = options.maxage || 0;

  return async(ctx, next) => {
    if (('GET' !== ctx.method.toUpperCase() && 'HEAD' !== ctx.method.toUpperCase())) return next();

    let path = ctx.path;
    path = path[0] === '/' ? path.substring(1) : path;
    let index = path.lastIndexOf('.');
    let extension;
    if (index < 1 || index > path.length - 2 || '' === (extension = path.substring(index + 1))) return next();

    path = resolvePath(options.root, path);

    let stats;
    try {
      stats = await fs.stat(path);
    } catch (e) {
      let notfound = ['ENOENT', 'ENAMER', 'ENOTDIR'];
      if (~notfound.indexOf(e.code)) return next();
      e.status = 500;
      throw e;
    }

    if (stats.isDirectory()) return next();

    let fn, body;
    if ((fn = options.extensions[extension]) && typeof fn === 'function') {
      body = await fn(await fs.readFile(path, 'utf8'), ctx);
    }else{
      ctx.type = extension;
    }

    let encoding = ctx.acceptsEncodings.apply(ctx, options.acceptsEncodings);

    if (options.compress && encoding && !body) {
      body = await compress(path, encoding);
      ctx.set('Content-Encoding', encoding);
    }

    if (!ctx.response.get('Last-Modified')) ctx.set('Last-Modified', stats.mtime.toUTCString());
    if (!ctx.response.get('Cache-Control')) ctx.set('Cache-Control', `max-age=${options.maxage / 1000 | 0}`)

    ctx.body = body || fs.createReadStream(path);
    return next();
  }
};