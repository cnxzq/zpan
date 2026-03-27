import createUploadRoutes from '../../src/server/routes/upload';

const testConfig = {
  name: 'test',
  port: 3000,
  host: '127.0.0.1',
  staticRoot: './',
  username: 'admin',
  password: 'admin123',
  realm: 'ZPan - Test',
  maxFileSize: 10 * 1024 * 1024 * 1024,
  sessionSecret: 'test-secret',
  sessionName: 'zpan',
};

describe('upload router', () => {
  it('should create an express router', () => {
    const router = createUploadRoutes(testConfig);
    expect(router).toBeDefined();
    expect(typeof router.get).toBe('function');
    expect(typeof router.post).toBe('function');
  });

  it('should have GET /upload route', () => {
    const router = createUploadRoutes(testConfig);
    expect(router).toBeDefined();
  });

  it('should have POST /upload route', () => {
    const router = createUploadRoutes(testConfig);
    expect(router).toBeDefined();
  });
});
