'use strict'
const fs = require('./fs.js')
const zlib = require('zlib')

let defaultCompressions = {
  gzip: {
    compress: zlib.createGzip,
    extension: 'gzip'
  },
  deflate: {
    compress: zlib.createDeflate,
    extension: 'deflate'
  }
}

/**
 *
 *
 * @param {Object} 自定义的压缩流
 * @returns 已压缩文件的读入流或未执行的压缩流
 */
module.exports = (compressions) => {
  compressions = Object.assign(defaultCompressions, compressions)

  return (sourcePath, encoding, options = {}) => {
    if (!options.path) options.path = sourcePath

    let compression = compressions[encoding]
    if (!compression) return
    let path = `${options.path}.${compression.extension}`

    return fs.access(path, 'r').then(() => {
      return fs.createReadStream(path)
    }).catch(() => {
      let fileStream = fs.createWriteStream(path)
      let encodingStream = compression.compress(options)
      fs.createReadStream(sourcePath).pipe(encodingStream).pipe(fileStream)

      encodingStream.pause()

      return encodingStream
    })
  }
}
