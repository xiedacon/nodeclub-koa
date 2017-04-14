'use strict'
const fs = require('./fs.js');

let defaultCompressions = {
  gzip: {
    compress: zlib.createGzip,
    extension: 'gzip'
  },
  deflate: {
    compress: zlib.createDeflate,
    extension: 'deflate'
  }
};

/**
 * 
 * 
 * @param {Object} 自定义的压缩流 
 * @returns 已压缩文件的读入流或未执行的压缩流
 */
module.exports = (compressions) => {

  compressions = Object.assign(defaultCompressions, compressions);

  return (source, encoding, options) => {
    let compression = compressions[encoding];
    let path = `${options.path}.${compression.extension}`;
    let fileStream = fs.createReadStream(path);

    if(fileStream) return fileStream;

    fileStream = fs.createWriteStream(path);
    let encodingStream = compression.compress(options);
    encodingStream.pipe(fileStream);
    encodingStream.pause();

    if(source instanceof Stream){
      source,pipe(encodingStream);
    }else{
      encodingStream.end(source);
    }
    
    return encodingStream;
  }
}