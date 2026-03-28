import type { ZpanConfig } from '@/index';
import { createServer } from '../../src/server/app';
import request from 'supertest';

describe('baseUrl 404 handling', () => {
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

  it('should return 404 when accessing /api/auth/login without baseUrl prefix', async () => {
    const app = createServer(testConfig);
    const response = await request(app).get('/api/auth/login');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not Found');
  });

  it('should return 200 for /pan/api/auth/login (correct prefix)', async () => {
    const app = createServer(testConfig);
    const response = await request(app).get('/pan/api/auth/login');
    // Auth API is allowed without login, should return something (not 404)
    expect(response.status).not.toBe(404);
  });

  it('should return 404 when accessing /api/list without baseUrl prefix', async () => {
    const app = createServer(testConfig);
    const response = await request(app).get('/api/list');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not Found');
  });

  it('should return 401 for /pan/api/list without login (correct prefix)', async () => {
    const app = createServer(testConfig);
    const response = await request(app).get('/pan/api/list');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });
});
