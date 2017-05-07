'use strict'

const { upload: config } = require('config-lite')
const tools = require('../common/tools.js')
var path = require('path')
var fs = require('fs')

module.exports = {
  upload: (file, { filename }) => {
    filename = tools.md5(filename + Date.now()) + path.extname(filename)

    file.pipe(fs.createWriteStream(path.join(config.path, filename)))
    return new Promise((resolve, reject) => {
      file.on('end', () => {
        resolve({ url: config.url + filename })
      })
    })
  }
}
