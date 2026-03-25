// 测试配置解析
describe('Config parsing', () => {
  test('PORT should be a number', () => {
    // 保存原始
    const originalArgv = process.argv;
    const originalEnv = {...process.env};
    
    process.argv = [process.argv[0], process.argv[1]];
    delete process.env.STATIC_ROOT;
    
    // 清除模块缓存重新加载
    jest.resetModules();
    const config = require('../src/config');
    
    expect(typeof config.PORT).toBe('number');
    expect(config.PORT).toBeGreaterThan(0);
    expect(config.PORT).toBeLessThan(65536);
    expect(typeof config.USERNAME).toBe('string');
    expect(typeof config.PASSWORD).toBe('string');
    expect(config.USERNAME).toBe(process.env.USERNAME || 'admin');
    expect(config.PASSWORD).toBe(process.env.PASSWORD || 'admin123');
    
    // 恢复
    process.argv = originalArgv;
    process.env = {...originalEnv};
  });

  test('should use environment variables', () => {
    const originalEnv = {...process.env};
    
    delete originalEnv.PORT;
    process.env = {...originalEnv};
    process.env.PORT = '9000';
    process.env.USERNAME = 'testuser';
    
    jest.resetModules();
    const config = require('../src/config');
    
    expect(config.PORT).toBe(9000);
    expect(typeof config.PORT).toBe('number');
    expect(config.USERNAME).toBe('testuser');
    
    process.env = {...originalEnv};
  });
});
