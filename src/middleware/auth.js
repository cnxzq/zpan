const basicAuth = require('express-basic-auth');
const config = require('../config');

function createAuthMiddleware() {
  const users = {};
  users[config.USERNAME] = config.PASSWORD;

  return basicAuth({
    users: users,
    challenge: true,
    realm: config.REALM
  });
}

module.exports = { createAuthMiddleware };
