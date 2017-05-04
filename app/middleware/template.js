'use strict'
const template = require('./art-template/template.js')
const config = require('config-lite')

template.config('base', config.viewPath)
template.config('extname', '.html')

module.exports = (source, data) => {
  return template.renderFile(source, data, true)
}
