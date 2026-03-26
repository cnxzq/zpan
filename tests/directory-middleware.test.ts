import { createDirectoryMiddleware } from '../src/middleware/directory.js';

describe('createDirectoryMiddleware', () => {
  it('should return static and directory middleware', () => {
    const result = createDirectoryMiddleware();
    expect(result.static).toBeDefined();
    expect(result.directory).toBeDefined();
    expect(typeof result.static).toBe('function');
    expect(typeof result.directory).toBe('function');
  });
});
