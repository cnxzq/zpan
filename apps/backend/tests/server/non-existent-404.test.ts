import type { ZpanConfig } from '@/index';
import { createServer } from '../../src/server/app';
import request from 'supertest';

describe('non-existent resources should return 404', () => {
  const testConfig: ZpanConfig = {
    baseUrl: '/pan',
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

  it('should return 404 for non-existent HTML page (not logged in)', async () => {
    const app = createServer(testConfig);
    const response = await request(app).get('/pan/non-existent');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not Found');
  });

  it('should return 404 for non-existent HTML page (logged in)', async () => {
    const app = createServer(testConfig);
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/pan/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const response = await agent.get('/pan/non-existent');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not Found');
  });

  it('should return 200 index.html for root (not logged in)', async () => {
    const app = createServer(testConfig);
    const response = await request(app).get('/pan/');
    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
    expect(response.text).toContain('<html');
  });

  it('should return 404 for non-existent API (not logged in)', async () => {
    const app = createServer(testConfig);
    const response = await request(app).get('/pan/api/non-existent');
    expect(response.status).toBe(401); // Not logged in returns 401, not 404
    expect(response.body.error).toBe('Unauthorized');
  });

  it('should return 404 for non-existent API (logged in)', async () => {
    const app = createServer(testConfig);
    const agent = request.agent(app);

    await agent
      .post('/pan/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const response = await agent.get('/pan/api/non-existent');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not Found');
  });
});
