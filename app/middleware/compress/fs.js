'use strict'
const fs = require('fs');

module.exports = {
  createReadStream: (path) => {
    try{
      fs.createReadStream(path);
    }catch(e){
      return null;
    }
  },
  createWriteStream: (path) => {
    return fs.createWriteStream(path);
  }
};