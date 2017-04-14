'use strict'
const send = require('koa-send');
const _path = require('path');
const parse = _path.parse;
const
  // 进来的参数有两个:根目录 path 后缀 less
  // fs.read()
  // cache? store
  // logger || console 


  module.exports = (root, option = {}) => {
    options.root = path
    let extensions = option.map || {};
    let compress = option.compress || false;

    return async(ctx, next) => {
      if ('GET' !== ctx.method.toUpperCase() && 'HEAD' !== ctx.method.toUpperCase()) return next();

      let path = ctx.path;
      let extension = path.substring(path.lastIndexOf('.') + 1);

      path = path.substring(parse(path).root.length);
      path = decode(path);
      if(-1 === path) return ctx.throw('failed to decode', 400);

      
        let fn;


      if (fn = extensions[extension] && typeof fn === 'function') {
        await extensions[extension](ctx);
      } else {

      }

      ctx.acceptsEncodings('gzip', 'deflate', 'identity');

      // return next();
      root
      index
      maxage
      hidden
      format
      extensions
      gzip
      setHeaders
      路径
      响应头
      后续处理
      return send(ctx, ctx.path, opts).then(() => {
        return next();
      });

      return next().then(() => {
        // 压缩

      });
    }
  };

function decode(path) {
  try {
    return decodeURIComponent(path);
  } catch (err) {
    return -1;
  }
}
// options = extend(true, {
//     cacheFile: null,
//     debug: false,
//     dest: source,
//     force: false,
//     once: false,
//     pathRoot: null,
//     postprocess: {
//       css: function(css, req) { return css; },
//       sourcemap: function(sourcemap, req) { return sourcemap; }
//     },
//     preprocess: {
//       less: function(src, req) { return src; },
//       path: function(pathname, req) { return pathname; },
//       importPaths: function(paths, req) { return paths; }
//     },
//     render: {
//       compress: 'auto',
//       yuicompress: false,
//       paths: []
//     },
//     storeCss: function(pathname, css, req, next) {
//       mkdirp(path.dirname(pathname), 511 /* 0777 */, function(err){
//         if (err) return next(err);

//         fs.writeFile(pathname, css, 'utf8', next);
//       });
//     },
//     storeSourcemap: function(pathname, sourcemap, req) {
//       mkdirp(path.dirname(pathname), 511 /* 0777 */, function(err){
//         if (err) {
//           utilities.lessError(err);
//           return;
//         }

//         fs.writeFile(pathname, sourcemap, 'utf8');
//       });
//     }
//   }, options || {});
