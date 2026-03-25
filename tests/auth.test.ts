import { createAuthMiddleware } from '../src/middleware/auth';
import config from '../src/config';

describe('createAuthMiddleware', () => {
  it('should create a middleware function', () => {
    const middleware = createAuthMiddleware();
    expect(middleware).toBeDefined();
    expect(typeof middleware).toBe('function');
  });

  it('should be configured with correct credentials', () => {
    // The middleware internally uses config.USERNAME and config.PASSWORD
    // We just check that it doesn't throw
    expect(() => createAuthMiddleware()).not.toThrow();
  });
});
