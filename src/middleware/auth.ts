import basicAuth from 'express-basic-auth';
import config from '../config';

export function createAuthMiddleware() {
  const users: Record<string, string> = {};
  users[config.USERNAME] = config.PASSWORD;

  return basicAuth({
    users: users,
    challenge: true,
    realm: config.REALM
  });
}
