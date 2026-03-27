import { authMiddleware } from '../src/middleware/auth.js';

describe('authMiddleware', () => {
  it('should export a middleware function', () => {
    expect(authMiddleware).toBeDefined();
    expect(typeof authMiddleware).toBe('function');
  });
});
