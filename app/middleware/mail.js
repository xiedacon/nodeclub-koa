'use strict'
const tools = require('../common/tools.js');
const config = require('config-lite');
const mailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const transporter = mailer.createTransport(smtpTransport(config.email));
const logger = require('./logger.js')

const secret = config.session.secret;
const siteName = config.site.name;
const SITE_ROOT_URL = `http://${config.host}`;
const from = `${siteName} ${config.email.auth.user}`;

module.exports = exports = {
  sendMail: (data) => {
    //if (config.debug) return;

    // 重试5次
    Promise.resolve(5).then(function retry(times, resolve) {
      if (times === 0 || !times) return resolve(times);

      return new Promise((resolve, reject) => {
        transporter.sendMail(data, (err) => {
          if (err) {
            // 写为日志
            logger.error('send mail error', err, data);
            return retry(--times, resolve);
          }
          return retry(undefined, resolve);
        });
      }).then((times) => {
        if (resolve) resolve(times);
        return times;
      });
    }).then((times) => {
      if (times === 0) return logger.error('send mail finally error', data);
      
      logger.info('send mail success', data);
    });
  },
  sendActiveMail: async(to, token, name) => {
    token = tools.md5(to + await tools.bhash(token) + secret);

    exports.sendMail({
      from: from,
      to: to,
      subject: `${siteName}社区账号激活`,
      html: `
      <p>您好：${name}</p>
      <p>我们收到您在${siteName}社区的注册信息，请点击下面的链接来激活帐户：</p>
      <a href  = "${SITE_ROOT_URL}/active_account?key=${token}&name=${name}">激活链接</a>
      <p>若您没有在${siteName}社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>
      <p>${siteName}社区 谨上。</p>
      `
    });
  },
  sendResetPassMail: async(to, token, name) => {
    exports.sendMail({
      from: from,
      to: `${siteName}社区密码重置`,
      subject: subject,
      html: `
      <p>您好：${name}</p>
      <p>我们收到您在${siteName}社区重置密码的请求，请在24小时内单击下面的链接来重置密码：</p>
      <a href  = "${SITE_ROOT_URL}/reset_pass?key=${token}&name=${name}">重置密码链接</a>
      <p>若您没有在${siteName}社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>
      <p>${siteName}社区 谨上。</p>
      `
    });
  }
};
