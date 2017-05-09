'use strict'

module.exports = (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken
  done(null, profile)
}
