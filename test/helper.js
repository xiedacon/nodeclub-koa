'use strict'

module.exports = {
  includes: (str, ...parts) => {
    if (!parts) return

    return parts.reduce((result, part) => { if (result) return str.includes(part) }, true)
  }
}
