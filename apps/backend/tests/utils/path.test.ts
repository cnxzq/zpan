import { resolveAndValidatePath } from '../../src/utils/path';
import path from 'path';

describe('resolveAndValidatePath - path traversal prevention', () => {
  // Use temp directory as admin static root
  const adminStaticRoot = path.resolve('/tmp/admin-root');

  it('should return valid path when requested path is within user root', () => {
    const userRootDir = 'users/alice';
    const requestedPath = 'documents/file.txt';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    const expected = path.resolve(adminStaticRoot, 'users/alice/documents/file.txt');
    expect(result).toBe(expected);
  });

  it('should return valid path when user root is at root (.)', () => {
    const userRootDir = '.';
    const requestedPath = 'any/file.txt';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    const expected = path.resolve(adminStaticRoot, 'any/file.txt');
    expect(result).toBe(expected);
  });

  it('should allow empty requested path (user root itself)', () => {
    const userRootDir = 'users/alice';
    const requestedPath = '';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    const expected = path.resolve(adminStaticRoot, 'users/alice');
    expect(result).toBe(expected);
  });

  it('should block path traversal with ../', () => {
    const userRootDir = 'users/alice';
    const requestedPath = '../bob/file.txt';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    expect(result).toBeNull();
  });

  it('should block deep path traversal with multiple ../', () => {
    const userRootDir = 'users/alice/sub';
    const requestedPath = '../../../../etc/passwd';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    expect(result).toBeNull();
  });

  it('should block absolute path escaping user root', () => {
    const userRootDir = 'users/alice';
    const requestedPath = '/etc/passwd';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    expect(result).toBeNull();
  });

  it('should handle encoded/normalized path traversal', () => {
    const userRootDir = 'users/alice';
    const requestedPath = './../bob/file.txt';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    expect(result).toBeNull();
  });

  it('should allow paths with .. in filename (not traversal)', () => {
    const userRootDir = 'users/alice';
    const requestedPath = 'file..txt';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    const expected = path.resolve(adminStaticRoot, 'users/alice/file..txt');
    expect(result).toBe(expected);
  });

  it('should allow paths containing .. in directory name (not traversal)', () => {
    const userRootDir = 'users/alice';
    const requestedPath = 'my..dir/file.txt';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    const expected = path.resolve(adminStaticRoot, 'users/alice/my..dir/file.txt');
    expect(result).not.toBeNull();
    expect(result).toContain('my..dir');
  });

  it('should work with Windows-style backslashes', () => {
    const userRootDir = 'users\\alice';
    const requestedPath = 'documents\\file.txt';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    expect(result).not.toBeNull();
    expect(result).toContain('users');
    expect(result).toContain('alice');
    expect(result).toContain('documents');
    expect(result).toContain('file.txt');
  });

  it('should block path traversal with backslashes on Windows', () => {
    const userRootDir = 'users\\alice';
    const requestedPath = '..\\bob\\file.txt';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    expect(result).toBeNull();
  });

  it('should allow sibling paths when user root is at root', () => {
    const userRootDir = '.';
    const requestedPath = 'other-dir/file.txt';

    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, requestedPath);

    const expected = path.resolve(adminStaticRoot, 'other-dir/file.txt');
    expect(result).toBe(expected);
  });

  it('should validate user root itself when checking with empty requested path', () => {
    // When user root itself escapes admin root, validate with empty path catches it
    const userRootDir = '../../outside';

    // This is how API validates when creating/updating user
    const result = resolveAndValidatePath(adminStaticRoot, userRootDir, '');

    expect(result).toBeNull();
  });
});

describe('getPublicPath - find public directory correctly', () => {
  // getPublicPath is tested implicitly by the server starting correctly,
  // but we can't easily unit test the full search since it depends on actual filesystem location
  // The search logic is:
  // 1. Look for dist/public (built version)
  // 2. Look for ./public (source/development mode) <-- this is the dev mode feature we added
  // 3. Fallback to cwd/dist/public
  // 4. Fallback to cwd/public

  // The most important thing to verify is that the algorithm correctly moves upward
  // and stops at root when not found
  // In our actual repo, we expect it to find the ./public at project root
  it('should find public directory in current project', async () => {
    // Just importing it means the module can load
    const { getPublicPath } = await import('../../src/utils/path');
    const result = getPublicPath();

    // Result should not be empty
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    // Should end with public
    expect(result.endsWith('public')).toBe(true);

    // In our actual project, index.html should exist there
    const fs = await import('fs');
    const path = await import('path');
    const indexPath = path.join(result, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
  });
});
