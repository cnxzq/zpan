import { parseArgs } from '../../src/config/loader';

describe('parseArgs', () => {
  it('should return null for all when no args', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js'];
    const result = parseArgs();
    expect(result.port).toBeNull();
    expect(result.staticRoot).toBeNull();
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

  it('should detect version flag', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli/index.js', '--version'];
    const result = parseArgs();
    expect(result.version).toBe(true);
    process.argv = originalArgv;
  });
});
