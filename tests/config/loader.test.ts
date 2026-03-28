import { loadConfig, normalBaseUrl, normalPanConfig } from '../../src/config/loader';
import type { JsonConfig } from '../../src/config/schema';

describe('config loader', () => {
  const emptyParsedArgs = {
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

  it('should have correct default values', () => {
    const config = loadConfig(emptyParsedArgs, null);

    expect(config.name).toBeDefined();
    expect(config.port).toBeDefined();
    expect(config.host).toBeDefined();
    expect(config.staticRoot).toBeDefined();
    expect(config.username).toBeDefined();
    expect(config.password).toBeDefined();
    expect(config.realm).toBeDefined();
    expect(config.maxFileSize).toBeDefined();
    expect(config.sessionSecret).toBeDefined();
    expect(config.sessionName).toBeDefined();
  });

  it('should have correct default port', () => {
    const config = loadConfig(emptyParsedArgs, null);
    expect(config.port).toBe(8090);
  });

  it('should have correct default maxFileSize (10GB)', () => {
    const config = loadConfig(emptyParsedArgs, null);
    const expected = 10 * 1024 * 1024 * 1024;
    expect(config.maxFileSize).toBe(expected);
  });

  it('should have default username as admin', () => {
    const config = loadConfig(emptyParsedArgs, null);
    expect(config.username).toBe('admin');
  });

  it('should have staticRoot defined', () => {
    const config = loadConfig(emptyParsedArgs, null);
    expect(config.staticRoot.length).toBeGreaterThan(0);
  });

  it('should have correct default username', () => {
    const config = loadConfig(emptyParsedArgs, null);
    expect(config.username).toBe('admin');
  });

  it('should have correct default password', () => {
    const config = loadConfig(emptyParsedArgs, null);
    expect(config.password).toBe('admin123');
  });

  it('should override with command line port argument', () => {
    const parsedArgs = {
      ...emptyParsedArgs,
      port: '9000',
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.port).toBe(9000);
  });

  it('should override maxFileSize with size string format', () => {
    const parsedArgs = {
      ...emptyParsedArgs,
      maxFileSize: '1GB',
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

  it('should merge config from json file', () => {
    const jsonConfig: JsonConfig = {
      name: 'json-zpan',
      port: 8888,
      host: '0.0.0.0',
      username: 'jsonuser',
      password: 'jsonpass',
    };
    const config = loadConfig(emptyParsedArgs, jsonConfig);
    expect(config.name).toBe('json-zpan');
    expect(config.port).toBe(8888);
    expect(config.host).toBe('0.0.0.0');
    expect(config.username).toBe('jsonuser');
    expect(config.password).toBe('jsonpass');
    // Unspecified fields should still have defaults
    expect(config.realm).toBe('ZPan - Protected Area');
    expect(config.maxFileSize).toBe(10 * 1024 * 1024 * 1024);
  });

  it('should give priority to CLI over json config', () => {
    const jsonConfig: JsonConfig = {
      name: 'json-name',
      port: 8888,
      username: 'jsonuser',
    };
    const parsedArgs = {
      ...emptyParsedArgs,
      name: 'cli-name',
      port: '9999',
    };
    const config = loadConfig(parsedArgs, jsonConfig);
    expect(config.name).toBe('cli-name');
    expect(config.port).toBe(9999);
    expect(config.username).toBe('jsonuser');
  });

  it('should normalize baseUrl - add leading slash', () => {
    const parsedArgs = {
      ...emptyParsedArgs,
      baseUrl: 'zpan',
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.baseUrl).toBe('/zpan');
  });

  it('should normalize baseUrl - remove trailing slash', () => {
    const parsedArgs = {
      ...emptyParsedArgs,
      baseUrl: '/zpan/',
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.baseUrl).toBe('/zpan');
  });

  it('should normalize baseUrl - add leading and remove trailing', () => {
    const parsedArgs = {
      ...emptyParsedArgs,
      baseUrl: 'zpan/',
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.baseUrl).toBe('/zpan');
  });

  it('should handle empty baseUrl', () => {
    const parsedArgs = {
      ...emptyParsedArgs,
      baseUrl: '',
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.baseUrl).toBe('');
  });

  it('should generate random sessionSecret when not provided', () => {
    const config = loadConfig(emptyParsedArgs, null);
    expect(config.sessionSecret).toBeDefined();
    expect(config.sessionSecret.length).toBeGreaterThan(0);
    // Should be 64 characters for 32 bytes hex
    expect(config.sessionSecret.length).toBe(64);
  });

  it('should use provided sessionSecret from CLI', () => {
    const parsedArgs = {
      ...emptyParsedArgs,
      sessionSecret: 'my-secret-key',
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.sessionSecret).toBe('my-secret-key');
  });

  it('should use provided sessionSecret from json config', () => {
    const jsonConfig: JsonConfig = {
      sessionSecret: 'json-secret',
    };
    const config = loadConfig(emptyParsedArgs, jsonConfig);
    expect(config.sessionSecret).toBe('json-secret');
  });

  it('should resolve staticRoot to absolute path', () => {
    const parsedArgs = {
      ...emptyParsedArgs,
      staticRoot: './relative/path',
    };
    const config = loadConfig(parsedArgs, null);
    expect(config.staticRoot).toMatch(/relative[\\/]path$/);
  });
});

describe('normalBaseUrl', () => {
  it('should return empty string for empty input', () => {
    expect(normalBaseUrl('')).toBe('');
  });

  it('should add leading slash when missing', () => {
    expect(normalBaseUrl('zpan')).toBe('/zpan');
    expect(normalBaseUrl('my/path')).toBe('/my/path');
  });

  it('should remove trailing slash', () => {
    expect(normalBaseUrl('/zpan/')).toBe('/zpan');
    // If input is just '/', after removing trailing slash we get empty string
    expect(normalBaseUrl('/')).toBe('');
    expect(normalBaseUrl('//')).toBe('/');
  });

  it('should do nothing when already correct', () => {
    expect(normalBaseUrl('/zpan')).toBe('/zpan');
    expect(normalBaseUrl('/my/path/to')).toBe('/my/path/to');
  });

  it('should add leading and remove trailing', () => {
    expect(normalBaseUrl('zpan/')).toBe('/zpan');
    expect(normalBaseUrl('my/path/')).toBe('/my/path');
  });
});

describe('normalPanConfig', () => {
  it('should fill all defaults when empty input', () => {
    const config = normalPanConfig({});
    expect(config.name).toBe('zpan');
    expect(config.port).toBe(8090);
    expect(config.host).toBe('127.0.0.1');
    expect(config.baseUrl).toBe('');
    expect(config.staticRoot).toBe('./');
    expect(config.username).toBe('admin');
    expect(config.password).toBe('admin123');
    expect(config.realm).toBe('ZPan - Protected Area');
    expect(config.maxFileSize).toBe(10737418240);
    expect(config.sessionSecret).toBe('');
    expect(config.sessionName).toBe('zpan');
  });

  it('should merge partial config with defaults', () => {
    const config = normalPanConfig({
      name: 'my-pan',
      port: 8080,
    });
    expect(config.name).toBe('my-pan');
    expect(config.port).toBe(8080);
    // Other fields should have defaults
    expect(config.host).toBe('127.0.0.1');
    expect(config.username).toBe('admin');
  });

  it('should overwrite all fields when provided', () => {
    const input = {
      name: 'custom',
      port: 1234,
      host: '0.0.0.0',
      baseUrl: '/custom',
      staticRoot: '/custom/root',
      username: 'customuser',
      password: 'custompass',
      realm: 'Custom Realm',
      maxFileSize: 1000000,
      sessionSecret: 'customsecret',
      sessionName: 'customsession',
    };
    const config = normalPanConfig(input);
    expect(config).toEqual(input);
  });
});
