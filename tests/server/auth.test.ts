import { authMiddleware } from '../../src/server/auth';

describe('authMiddleware', () => {
  it('should export a middleware function', () => {
    expect(authMiddleware).toBeDefined();
    expect(typeof authMiddleware).toBe('function');
  });
});
