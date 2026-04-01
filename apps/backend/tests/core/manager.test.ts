import { InstanceManager } from '../../src/core/manager';
import { ZpanInstance } from '../../src/core/instance';

describe('InstanceManager', () => {
  it('should create instance', () => {
    const manager = new InstanceManager();
    const config = {
      name: 'test',
      port: 3000,
      host: '127.0.0.1',
      staticRoot: './uploads',
      username: 'admin',
      password: '123456',
      realm: 'Test',
      maxFileSize: 10 * 1024 * 1024 * 1024,
      sessionSecret: 'secret',
      sessionName: 'zpan',
    };

    const instance = manager.create(config);
    expect(instance).toBeInstanceOf(ZpanInstance);
    expect(manager.get('test')).toBe(instance);
  });

  it('should list instances', () => {
    const manager = new InstanceManager();
    const config1 = {
      name: 'test1',
      port: 3000,
      host: '127.0.0.1',
      staticRoot: './uploads1',
      username: 'admin',
      password: '123456',
      realm: 'Test',
      maxFileSize: 10 * 1024 * 1024 * 1024,
      sessionSecret: 'secret',
      sessionName: 'zpan',
    };
    const config2 = {
      name: 'test2',
      port: 3001,
      host: '127.0.0.1',
      staticRoot: './uploads2',
      username: 'admin',
      password: '123456',
      realm: 'Test',
      maxFileSize: 10 * 1024 * 1024 * 1024,
      sessionSecret: 'secret',
      sessionName: 'zpan',
    };

    manager.create(config1);
    manager.create(config2);

    const list = manager.list();
    expect(list).toHaveLength(2);
  });

  it('should remove instance', async () => {
    const manager = new InstanceManager();
    const config = {
      name: 'test',
      port: 3000,
      host: '127.0.0.1',
      staticRoot: './uploads',
      username: 'admin',
      password: '123456',
      realm: 'Test',
      maxFileSize: 10 * 1024 * 1024 * 1024,
      sessionSecret: 'secret',
      sessionName: 'zpan',
    };

    manager.create(config);
    expect(manager.get('test')).toBeDefined();

    const result = await manager.remove('test');
    expect(result).toBe(true);
    expect(manager.get('test')).toBeUndefined();
  });
});
