import config from '../src/config';

describe('config', () => {
  it('should have default values', () => {
    expect(config.PORT).toBeDefined();
    expect(config.HOST).toBeDefined();
    expect(config.STATIC_ROOT).toBeDefined();
    expect(config.USERNAME).toBeDefined();
    expect(config.PASSWORD).toBeDefined();
    expect(config.REALM).toBeDefined();
    expect(config.MAX_FILE_SIZE).toBeDefined();
  });

  it('should have correct default PORT', () => {
    // If PORT not set in env, default is 8090
    const defaultPort = process.env.PORT ? parseInt(process.env.PORT) : 8090;
    expect(config.PORT).toBe(defaultPort);
  });

  it('should have correct default MAX_FILE_SIZE (10GB)', () => {
    const expected = 10 * 1024 * 1024 * 1024;
    expect(config.MAX_FILE_SIZE).toBe(expected);
  });

  it('should have default USERNAME as admin', () => {
    const defaultUsername = process.env.USERNAME || 'admin';
    expect(config.USERNAME).toBe(defaultUsername);
  });

  it('should have STATIC_ROOT defined', () => {
    expect(config.STATIC_ROOT.length).toBeGreaterThan(0);
  });
});
