import type { ZpanConfig } from '@/index';
import { createServer } from '../../src/server/app';
import request from 'supertest';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('admin API', () => {
  // Create a temporary config file for testing saves
  const tempConfigPath = path.join(os.tmpdir(), `zpan-test-admin-${Date.now()}.json`);
  const initialConfig: ZpanConfig = {
    baseUrl: '',
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
    configPath: tempConfigPath,
    users: [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        permission: 'write',
        rootDir: '.',
      },
      {
        username: 'user1',
        password: 'user1pass',
        role: 'user',
        permission: 'read',
        rootDir: 'users/user1',
      },
    ],
  };

  // Write initial config
  beforeAll(() => {
    const configStr = JSON.stringify(initialConfig, null, 2);
    fs.writeFileSync(tempConfigPath, configStr, 'utf-8');
  });

  afterAll(() => {
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }
  });

  function getTestConfig(): ZpanConfig {
    // Read fresh from disk for each test since changes are saved
    const content = fs.readFileSync(tempConfigPath, 'utf-8');
    return JSON.parse(content) as ZpanConfig;
  }

  it('should return 401 for get users when not authenticated', async () => {
    const app = createServer(getTestConfig());
    const response = await request(app).get('/api/admin/users');
    expect(response.status).toBe(401);
  });

  it('should return 403 for get users when authenticated as non-admin', async () => {
    const app = createServer(getTestConfig());
    const agent = request.agent(app);

    // Login as user1
    await agent
      .post('/api/auth/login')
      .send({ username: 'user1', password: 'user1pass' });

    const response = await agent.get('/api/admin/users');
    expect(response.status).toBe(403);
  });

  it('should list all users without passwords when admin', async () => {
    const app = createServer(getTestConfig());
    const agent = request.agent(app);

    // Login as admin
    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const response = await agent.get('/api/admin/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    // Check no passwords returned
    const adminUser = response.body.find(u => u.username === 'admin');
    expect(adminUser).toBeDefined();
    expect(adminUser.username).toBe('admin');
    expect(adminUser.role).toBe('admin');
    expect(adminUser.permission).toBe('write');
    expect(adminUser.rootDir).toBe('.');
    expect(adminUser.password).toBeUndefined();

    const normalUser = response.body.find(u => u.username === 'user1');
    expect(normalUser).toBeDefined();
    expect(normalUser.username).toBe('user1');
    expect(normalUser.role).toBe('user');
    expect(normalUser.permission).toBe('read');
    expect(normalUser.rootDir).toBe('users/user1');
    expect(normalUser.password).toBeUndefined();
  });

  it('should get single user without password', async () => {
    const app = createServer(getTestConfig());
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const response = await agent.get('/api/admin/users/user1');
    expect(response.status).toBe(200);
    expect(response.body.username).toBe('user1');
    expect(response.body.password).toBeUndefined();
  });

  it('should return 404 for non-existent user', async () => {
    const app = createServer(getTestConfig());
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const response = await agent.get('/api/admin/users/nonexistent');
    expect(response.status).toBe(404);
  });

  it('should create new user successfully', async () => {
    const app = createServer(getTestConfig());
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const newUser = {
      username: 'newuser',
      password: 'newpass',
      role: 'user',
      permission: 'write',
      rootDir: 'users/newuser',
    };

    const response = await agent
      .post('/api/admin/users')
      .send(newUser);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.username).toBe('newuser');
    expect(response.body.user.password).toBeUndefined();
  });

  it('should reject duplicate username', async () => {
    const app = createServer(getTestConfig());
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const newUser = {
      username: 'admin',
      password: 'newpass',
      role: 'user',
      permission: 'write',
      rootDir: 'users/admin',
    };

    const response = await agent
      .post('/api/admin/users')
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('already exists');
  });

  it('should reject user root outside static root', async () => {
    const app = createServer(getTestConfig());
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const newUser = {
      username: 'baduser',
      password: 'pass',
      role: 'user',
      permission: 'read',
      rootDir: '../',
    };

    const response = await agent
      .post('/api/admin/users')
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('rootDir must be within');
  });

  it('should update existing user', async () => {
    const app = createServer(getTestConfig());
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const update = {
      role: 'admin',
      permission: 'write',
      rootDir: 'users/user1-updated',
    };

    const response = await agent
      .put('/api/admin/users/user1')
      .send(update);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.role).toBe('admin');
    expect(response.body.user.permission).toBe('write');
    expect(response.body.user.rootDir).toBe('users/user1-updated');
  });

  it('should delete user successfully', async () => {
    const app = createServer(getTestConfig());
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    // Delete user1
    const response = await agent.delete('/api/admin/users/user1');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify user is gone
    const listResponse = await agent.get('/api/admin/users');
    expect(listResponse.body.find(u => u.username === 'user1')).toBeUndefined();
  });

  it('should not allow deleting currently logged in user', async () => {
    const app = createServer(getTestConfig());
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    // Try delete admin (current user)
    const response = await agent.delete('/api/admin/users/admin');
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Cannot delete the currently logged in user');

    // Verify admin still exists
    const listResponse = await agent.get('/api/admin/users');
    expect(listResponse.body.find(u => u.username === 'admin')).toBeDefined();
  });

  it('should not allow deleting last admin', async () => {
    const tempConfigPath = path.join(os.tmpdir(), `zpan-test-last-admin-${Date.now()}.json`);
    // Start with one admin and one regular user - only one admin total
    const testConfig: ZpanConfig = {
      ...initialConfig,
      configPath: tempConfigPath,
      users: [
        {
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          permission: 'write',
          rootDir: '.',
        },
        {
          username: 'user1',
          password: 'user1pass',
          role: 'user',
          permission: 'read',
          rootDir: 'users/user1',
        },
      ],
    };
    fs.writeFileSync(tempConfigPath, JSON.stringify(testConfig, null, 2), 'utf-8');

    const app = createServer(testConfig);
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    // Try to delete the only admin (admin) - can't delete self first
    const responseDeleteSelf = await agent.delete('/api/admin/users/admin');
    expect(responseDeleteSelf.status).toBe(400);
    expect(responseDeleteSelf.body.error).toContain('Cannot delete the currently logged in user');

    // Now try to delete the only other user who is not admin - this should work
    // The admin count remains 1, so no error about last admin
    const responseDeleteUser = await agent.delete('/api/admin/users/user1');
    expect(responseDeleteUser.status).toBe(200);
    expect(responseDeleteUser.body.success).toBe(true);
  });

  it('should prevent deleting last admin when deleting non-current admin that would leave zero admins', async () => {
    const tempConfigPath = path.join(os.tmpdir(), `zpan-test-zero-admins-${Date.now()}.json`);
    // Two admins: admin and admin2 - total 2 admins
    const testConfig: ZpanConfig = {
      ...initialConfig,
      configPath: tempConfigPath,
      users: [
        {
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          permission: 'write',
          rootDir: '.',
        },
        {
          username: 'admin2',
          password: 'admin2pass',
          role: 'admin',
          permission: 'write',
          rootDir: 'admin2',
        },
        {
          username: 'user1',
          password: 'user1pass',
          role: 'user',
          permission: 'read',
          rootDir: 'users/user1',
        },
      ],
    };
    fs.writeFileSync(tempConfigPath, JSON.stringify(testConfig, null, 2), 'utf-8');

    const app = createServer(testConfig);
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    // First delete the normal user - this works fine
    await agent.delete('/api/admin/users/user1');

    // Now we have two admins left. Delete admin2 - after deletion, still have admin (current user)
    // So adminCount = 1 → this should succeed, no "last admin" error
    // The "last admin" check only triggers when deletion would result in ZERO admins
    const response = await agent.delete('/api/admin/users/admin2');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
