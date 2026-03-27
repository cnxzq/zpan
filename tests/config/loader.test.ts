import { loadConfig, parseArgs } from '../../src/config/loader';

describe('config loader', () => {
  it('should have correct default values', () => {
    const parsedArgs = {
      name: null,
      port: null,
      host: null,
      staticRoot: null,
      username: null,
      password: null,
      realm: null,
      maxFileSize: null,
      sessionSecret: null,
      sessionName: null,
      configPath: null,
      init: false,
      help: false,
      version: false,
    };
    const config = loadConfig(parsedArgs, null);

    expect(config.name).toBeDefined();
    expect(config.port).toBeDefined();
    expect(config.host).toBeDefined();
    expect(config.staticRoot).toBeDefined();
    expect(config.username).toBeDefined();
    expect(config.password).toBeDefined();
    expect(config.realm).toBeDefined();
    expect(config.maxFileSize).toBeDefined();
  });

  it('should have correct default port', () => {
    const parsedArgs = {
      name: null,
      port: null,
      host: null,
      staticRoot: null,
      username: null,
      password: null,
      realm: null,
      maxFileSize: null,
      sessionSecret: null,
      sessionName: null,
      configPath: null,
      init: false,
      help: false,
      version: false,
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.port).toBe(8090);
  });

  it('should have correct default maxFileSize (10GB)', () => {
    const parsedArgs = {
      name: null,
      port: null,
      host: null,
      staticRoot: null,
      username: null,
      password: null,
      realm: null,
      maxFileSize: null,
      sessionSecret: null,
      sessionName: null,
      configPath: null,
      init: false,
      help: false,
      version: false,
    };
    const config = loadConfig(parsedArgs, null);
    const expected = 10 * 1024 * 1024 * 1024;
    expect(config.maxFileSize).toBe(expected);
  });

  it('should have default username as admin', () => {
    const parsedArgs = {
      name: null,
      port: null,
      host: null,
      staticRoot: null,
      username: null,
      password: null,
      realm: null,
      maxFileSize: null,
      sessionSecret: null,
      sessionName: null,
      configPath: null,
      init: false,
      help: false,
      version: false,
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.username).toBe('admin');
  });

  it('should have staticRoot defined', () => {
    const parsedArgs = {
      name: null,
      port: null,
      host: null,
      staticRoot: null,
      username: null,
      password: null,
      realm: null,
      maxFileSize: null,
      sessionSecret: null,
      sessionName: null,
      configPath: null,
      init: false,
      help: false,
      version: false,
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.staticRoot.length).toBeGreaterThan(0);
  });

  it('should have correct default username', () => {
    const parsedArgs = {
      name: null,
      port: null,
      host: null,
      staticRoot: null,
      username: null,
      password: null,
      realm: null,
      maxFileSize: null,
      sessionSecret: null,
      sessionName: null,
      configPath: null,
      init: false,
      help: false,
      version: false,
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.username).toBe('admin');
  });

  it('should have correct default password', () => {
    const parsedArgs = {
      name: null,
      port: null,
      host: null,
      staticRoot: null,
      username: null,
      password: null,
      realm: null,
      maxFileSize: null,
      sessionSecret: null,
      sessionName: null,
      configPath: null,
      init: false,
      help: false,
      version: false,
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.password).toBe('admin123');
  });

  it('should override with command line port argument', () => {
    const parsedArgs = {
      name: null,
      port: '9000',
      host: null,
      staticRoot: null,
      username: null,
      password: null,
      realm: null,
      maxFileSize: null,
      sessionSecret: null,
      sessionName: null,
      configPath: null,
      init: false,
      help: false,
      version: false,
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.port).toBe(9000);
  });

  it('should override maxFileSize with size string format', () => {
    const parsedArgs = {
      name: null,
      port: null,
      host: null,
      staticRoot: null,
      username: null,
      password: null,
      realm: null,
      maxFileSize: '1GB',
      sessionSecret: null,
      sessionName: null,
      configPath: null,
      init: false,
      help: false,
      version: false,
    };
    const config = loadConfig(parsedArgs, null);
    const expected = 1 * 1024 * 1024 * 1024;
    expect(config.maxFileSize).toBe(expected);
  });

  it('should override all config parameters from CLI', () => {
    const parsedArgs = {
      name: 'my-zpan',
      port: '9000',
      host: '0.0.0.0',
      staticRoot: '/tmp/files',
      username: 'myuser',
      password: 'mypass',
      realm: 'My ZPan',
      maxFileSize: '500MB',
      sessionSecret: 'my-secret',
      sessionName: 'my-zpan-session',
      configPath: null,
      init: false,
      help: false,
      version: false,
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.name).toBe('my-zpan');
    expect(config.port).toBe(9000);
    expect(config.host).toBe('0.0.0.0');
    expect(config.staticRoot).toMatch(/tmp[\\/]files/);
    expect(config.username).toBe('myuser');
    expect(config.password).toBe('mypass');
    expect(config.realm).toBe('My ZPan');
    expect(config.maxFileSize).toBe(500 * 1024 * 1024);
    expect(config.sessionSecret).toBe('my-secret');
    expect(config.sessionName).toBe('my-zpan-session');
  });
});
