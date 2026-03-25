import { createDirectoryMiddleware } from '../src/middleware/directory';

describe('createDirectoryMiddleware', () => {
  it('should return an object with both middleware', () => {
    const result = createDirectoryMiddleware();
    expect(result.static).toBeDefined();
    expect(result.directory).toBeDefined();
    expect(typeof result.static).toBe('function');
    expect(typeof result.directory).toBe('function');
  });
});
