import { parseArgs } from '../../src/config/loader';

describe('parseArgs', () => {
  it('should return null for all when no args', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js'];
    const result = parseArgs();
    expect(result.port).toBeNull();
    expect(result.staticRoot).toBeNull();
    expect(result.name).toBeNull();
    expect(result.host).toBeNull();
    expect(result.baseUrl).toBeNull();
    expect(result.username).toBeNull();
    expect(result.password).toBeNull();
    expect(result.realm).toBeNull();
    expect(result.maxFileSize).toBeNull();
    expect(result.sessionSecret).toBeNull();
    expect(result.sessionName).toBeNull();
    expect(result.init).toBe(false);
    expect(result.help).toBe(false);
    expect(result.version).toBe(false);
    process.argv = originalArgv;
  });

  it('should parse port only', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '8080'];
    const result = parseArgs();
    expect(result.port).toBe('8080');
    expect(result.staticRoot).toBeNull();
    process.argv = originalArgv;
  });

  it('should parse port and directory', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '8080', '/path/to/dir'];
    const result = parseArgs();
    expect(result.port).toBe('8080');
    expect(result.staticRoot).toBe('/path/to/dir');
    process.argv = originalArgv;
  });

  it('should detect init command', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', 'init'];
    const result = parseArgs();
    expect(result.init).toBe(true);
    process.argv = originalArgv;
  });

  it('should detect help flag', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--help'];
    const result = parseArgs();
    expect(result.help).toBe(true);
    process.argv = originalArgv;
  });

  it('should detect help flag with short alias', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '-h'];
    const result = parseArgs();
    expect(result.help).toBe(true);
    process.argv = originalArgv;
  });

  it('should detect version flag', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--version'];
    const result = parseArgs();
    expect(result.version).toBe(true);
    process.argv = originalArgv;
  });

  it('should detect version flag with short alias', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '-v'];
    const result = parseArgs();
    expect(result.version).toBe(true);
    process.argv = originalArgv;
  });

  it('should parse config path with --config', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--config', 'my.config.json'];
    const result = parseArgs();
    expect(result.configPath).toBe('my.config.json');
    process.argv = originalArgv;
  });

  it('should parse config path with -c alias', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '-c', 'my.config.json'];
    const result = parseArgs();
    expect(result.configPath).toBe('my.config.json');
    process.argv = originalArgv;
  });

  it('should parse --name', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--name', 'my-zpan'];
    const result = parseArgs();
    expect(result.name).toBe('my-zpan');
    process.argv = originalArgv;
  });

  it('should parse --port', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--port', '9090'];
    const result = parseArgs();
    expect(result.port).toBe('9090');
    process.argv = originalArgv;
  });

  it('should parse --host', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--host', '0.0.0.0'];
    const result = parseArgs();
    expect(result.host).toBe('0.0.0.0');
    process.argv = originalArgv;
  });

  it('should parse --base-url', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--base-url', '/zpan'];
    const result = parseArgs();
    expect(result.baseUrl).toBe('/zpan');
    process.argv = originalArgv;
  });

  it('should parse --baseUrl (camelCase)', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--baseUrl', '/zpan'];
    const result = parseArgs();
    expect(result.baseUrl).toBe('/zpan');
    process.argv = originalArgv;
  });

  it('should parse --root', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--root', '/path/to/root'];
    const result = parseArgs();
    expect(result.staticRoot).toBe('/path/to/root');
    process.argv = originalArgv;
  });

  it('should parse --static-root', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--static-root', '/path/to/static'];
    const result = parseArgs();
    expect(result.staticRoot).toBe('/path/to/static');
    process.argv = originalArgv;
  });

  it('should parse --username', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--username', 'myuser'];
    const result = parseArgs();
    expect(result.username).toBe('myuser');
    process.argv = originalArgv;
  });

  it('should parse --user alias', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--user', 'myuser'];
    const result = parseArgs();
    expect(result.username).toBe('myuser');
    process.argv = originalArgv;
  });

  it('should parse --password', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--password', 'mypass'];
    const result = parseArgs();
    expect(result.password).toBe('mypass');
    process.argv = originalArgv;
  });

  it('should parse --pass alias', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--pass', 'mypass'];
    const result = parseArgs();
    expect(result.password).toBe('mypass');
    process.argv = originalArgv;
  });

  it('should parse --realm', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--realm', 'My Realm'];
    const result = parseArgs();
    expect(result.realm).toBe('My Realm');
    process.argv = originalArgv;
  });

  it('should parse --max-size', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--max-size', '1GB'];
    const result = parseArgs();
    expect(result.maxFileSize).toBe('1GB');
    process.argv = originalArgv;
  });

  it('should parse --max-file-size', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--max-file-size', '2GB'];
    const result = parseArgs();
    expect(result.maxFileSize).toBe('2GB');
    process.argv = originalArgv;
  });

  it('should parse --session-secret', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--session-secret', 'my-secret-key'];
    const result = parseArgs();
    expect(result.sessionSecret).toBe('my-secret-key');
    process.argv = originalArgv;
  });

  it('should parse --session-name', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--session-name', 'my-session'];
    const result = parseArgs();
    expect(result.sessionName).toBe('my-session');
    process.argv = originalArgv;
  });

  it('should parse multiple options together', () => {
    const originalArgv = process.argv;
    process.argv = [
      'node', 'dist/cli/index.js',
      '--port', '8080',
      '--host', '0.0.0.0',
      '--username', 'user',
      '--password', 'pass',
    ];
    const result = parseArgs();
    expect(result.port).toBe('8080');
    expect(result.host).toBe('0.0.0.0');
    expect(result.username).toBe('user');
    expect(result.password).toBe('pass');
    process.argv = originalArgv;
  });

  it('should handle start command with options', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', 'start', '--port', '8080'];
    const result = parseArgs();
    expect(result.port).toBe('8080');
    process.argv = originalArgv;
  });
});
