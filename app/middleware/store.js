'use strict'

const qn = require('./store_qn.js')
const local = require('./store_local.js')

module.exports = qn || local
