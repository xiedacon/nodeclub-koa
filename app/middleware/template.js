'use strict'
const template = require('./art-template/template.js');

module.exports = (base, extname) => {
    template.config('base', base);
    template.config('extname', extname);

    return (source, data) => {
        return template.renderFile(source, data, true);
    }
}