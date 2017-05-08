'use strict'

const config = require('config-lite')

module.exports = {
  console: console,
  config: config.site,
  Loader: require('./loader.js'),
  assets: config.assets,
  staticFile: (url) => { return url },
  proxy: (url) => {
    return url
    // 当 google 和 github 封锁严重时，则需要通过服务器代理访问它们的静态资源
    // return '/agent?url=' + encodeURIComponent(url);
  },
  escapeSignature: function (signature) {
    return signature.split('\n').map(function (p) {
      return p
    }).join('<br>')
  },
  PageHelper: (base, currentPage, pages) => {
    if (pages === 1) {
      return `
          <li class='disabled'><a>«</a></li>
          <li class='disabled'><a>1</a></li>
          <li class='disabled'><a>»</a></li>`
    } else {
      let limit = 5
      let middle = Math.ceil(limit / 2) // 中数
      let begin = currentPage - (middle - 1) // 开始位默认值
      let end = currentPage + (middle - 1) // 结束位默认值
      let content = currentPage === 1 ? `<li class='disabled'><a>«</a></li>` : `<li><a href='${base + 1}'>«</a></li>`
      if (currentPage < middle) { // 中数以下
        begin = 1
        end = limit
      } else {
        content += `<li><a>...</a></li>`
      }
      if (pages < end) { // 结束位修正
        end = pages
      }
      for (let i = begin; i < end; i++) {
        content += (i === currentPage ? `<li class='disabled'><a>${i}</a></li>` : `<li><a href='${base + i}'>${i}</a></li>`)
      }
      if (currentPage === pages) return (content += `<li class='disabled'><a>»</a></li>`)
      if (end !== pages) return (content += `<li><a>...</a></li><li><a href='${base + pages}'>»</a></li>`)
      return (content += `<li><a href='${base + pages}'>»</a></li>`)
    }
  },
  markdown: require('./markdown.js'),
  multiline: require('multiline')
}
