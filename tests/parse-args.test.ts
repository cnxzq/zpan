import { parseArgs } from '../src/config.js';

describe('parseArgs', () => {
  it('should return null for both when no args', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli.js'];
    const result = parseArgs();
    expect(result.portArg).toBeNull();
    expect(result.dirArg).toBeNull();
    process.argv = originalArgv;
  });

  it('should parse port only', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli.js', '8080'];
    const result = parseArgs();
    expect(result.portArg).toBe('8080');
    expect(result.dirArg).toBeNull();
    process.argv = originalArgv;
  });

  it('should parse port and directory', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'dist/cli.js', '8080', '/path/to/dir'];
    const result = parseArgs();
    expect(result.portArg).toBe('8080');
    expect(result.dirArg).toBe('/path/to/dir');
    process.argv = originalArgv;
  });
});
