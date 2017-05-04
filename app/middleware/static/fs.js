'use strict'
const fs = require('fs')

module.exports = {
  createReadStream: (path) => {
    return fs.createReadStream(path)
  },
  createWriteStream: (path) => {
    return fs.createWriteStream(path)
  },
  access: (path, mode) => {
    return new Promise((resolve, reject) => {
      fs.access(path, mode || 'r', (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  },
  stat: (path) => {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err, stats) => {
        if (err) return reject(err)
        resolve(stats)
      })
    })
  },
  readFile: (file, options = {}) => {
    return new Promise((resolve, reject) => {
      fs.readFile(file, options, (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }
}
