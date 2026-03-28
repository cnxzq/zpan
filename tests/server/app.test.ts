import type { ZpanConfig } from '@/index';
import { createServer } from '../../src/server/app';
import request from 'supertest';

describe('createServer', () => {
  const testConfig:ZpanConfig = {
    baseUrl:"/pan",
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

  /**测试静态服务 */
  it('应返回vue.global.js', async () => {
    const app = createServer(testConfig);

    // POST with wrong password to API
    const response = await request(app)
      .get('/pan/vue.global.js')
    expect(response.type).toBe('application/javascript');
  });

  it('should create an express app', () => {
    const app = createServer(testConfig);
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  it('should serve index.html when not authenticated (SPA architecture)', async () => {
    const app = createServer(testConfig);
    const response = await request(app).get(testConfig.baseUrl + '/');
    // In SPA architecture, frontend static files don't require auth
    // Frontend javascript checks auth status and handles redirect client-side
    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
  });

  it('should return 401 for API when not authenticated', async () => {
    const app = createServer(testConfig);
    // API is after auth middleware, so should return 401 Unauthorized
    const apiPath = `${testConfig.baseUrl}/api/list`;
    const response = await request(app).get(apiPath).query({ dir: '.' });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });
});

// Check auth status API
describe('auth status API', () => {
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

  it('should return login status when not logged in', async () => {
    const app = createServer(testConfig);
    const response = await request(app).get('/api/auth/status');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ loggedIn: false });
  });
});

describe('full login flow', () => {
  const testConfig = {
    baseUrl:'',
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

  it('should return 404 when GET /login (no backend route)', async () => {
    const app = createServer(testConfig);
    const baseUrl = testConfig.baseUrl || '';
    const response = await request(app).get(`${baseUrl}/login`);
    // /login has no backend route - should return 404
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not Found');
  });

  it('should complete login with correct credentials via API', async () => {
    const app = createServer(testConfig);

    // POST login with correct username/password to API
    const username = testConfig.username;
    const password = testConfig.password;
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username, password });

    // Should return success JSON
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.success).toBe(true);

    // After login, session should be authenticated
    // Use agent to keep cookies (session)
    const agent = request.agent(app);
    await agent
      .post('/api/auth/login')
      .send({ username, password });

    // Check auth status
    const statusResponse = await agent.get('/api/auth/status');
    expect(statusResponse.body.loggedIn).toBe(true);

    // Now accessing API should be allowed
    const apiResponse = await agent.get('/api/list').query({ dir: '.' });
    expect(apiResponse.statusCode).toBe(200);
  });

  it('should reject login with wrong credentials', async () => {
    const app = createServer(testConfig);

    // POST with wrong password to API
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'wrong', password: 'wrong' });

    // Should return JSON with success: false
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.success).toBe(false);
  });
});
