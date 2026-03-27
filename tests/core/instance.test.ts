import { ZpanInstance } from '../../src/core/instance';

describe('ZpanInstance', () => {
  it('should create instance correctly', () => {
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
    const ins = new ZpanInstance(config);
    expect(ins).toBeInstanceOf(ZpanInstance);
    expect(ins.running).toBe(false);
    expect(ins.config).toEqual(config);
  });
});
