'use strict'
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const moment = require('moment');

moment.locale('zh-CN'); // 使用中文

module.exports = {
  validateId: (str) => {
    return (/^[a-zA-Z0-9\-_]+$/i).test(str);
  },
  md5: md5,
  makeGravatar: (str) => {
    return `http://www.gravatar.com/avatar/${md5(str)}?size=48`;
  },
  bhash: (str) => {
    return bcrypt.hash(str, 10);
  },
  bcompare: (str, hash) => {
    return bcrypt.compare(str, hash);
  },
  formatDate: (date, friendly) => {
    date = moment(date);

    if (friendly) {
      return date.fromNow();
    } else {
      return date.format('YYYY-MM-DD HH:mm');
    }
  }
}

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}
