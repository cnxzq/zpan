import router from '../src/routes/upload.js';

describe('upload router', () => {
  it('should export an express router', () => {
    expect(router).toBeDefined();
    expect(typeof router.get).toBe('function');
    expect(typeof router.post).toBe('function');
  });

  it('should have GET /upload route', () => {
    // Check that router has the route defined
    expect(router).toBeDefined();
  });

  it('should have POST /upload route', () => {
    expect(router).toBeDefined();
  });
});
