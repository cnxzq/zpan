import path from 'path';
import fs from 'fs';

/**
 * Get the absolute path to the public directory
 * Uses import.meta.dirname and searches upward until it finds public/index.html
 * This works regardless of how the code is packaged (tsup chunking doesn't break it).
 *
 * Works for:
 * - Local development
 * - Built dist with any chunk structure
 * - Global installed/npm link
 */
export function getPublicPath(): string {
  // Start from current module directory and search upward
  let currentDir = import.meta.dirname;

  // Try up to 10 levels deep to avoid infinite loop
  for (let i = 0; i < 10; i++) {
    // First look for original public (development mode - source code)
    // In development, we want to use the current source files, not the built dist
    const candidate = path.join(currentDir, 'public');
    const indexPath = path.join(candidate, 'index.html');
    if (fs.existsSync(indexPath)) {
      return candidate;
    }
    // Then look for dist/public (built version with version injected)
    const distCandidate = path.join(currentDir, 'dist', 'public');
    const distIndexPath = path.join(distCandidate, 'index.html');
    if (fs.existsSync(distIndexPath)) {
      return distCandidate;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached root, stop searching
      break;
    }
    currentDir = parentDir;
  }

  // If still not found, try cwd/public first (development mode)
  const fallback = path.join(process.cwd(), 'public');
  const indexPath = path.join(fallback, 'index.html');
  if (fs.existsSync(indexPath)) {
    return fallback;
  }

  // Fall back to cwd/dist/public
  const distFallback = path.join(process.cwd(), 'dist', 'public');
  const distIndexPath = path.join(distFallback, 'index.html');
  if (fs.existsSync(distIndexPath)) {
    return distFallback;
  }

  // Final fallback
  return fallback;
}

/**
 * Get the path to index.html
 */
export function getIndexHtmlPath(): string {
  return path.join(getPublicPath(), 'index.html');
}

/**
 * Resolve and validate requested path against user's root directory
 * Ensures:
 * 1. The user root directory is within the admin static root
 * 2. The requested path does not escape the user's root directory
 *
 * @param adminStaticRoot - Admin's static root (absolute)
 * @param userRootDir - User's root dir (relative to adminStaticRoot)
 * @param requestedPath - Requested path (relative to user's root)
 * @returns Validated absolute path or null if invalid/outside
 */
export function resolveAndValidatePath(
  adminStaticRoot: string,
  userRootDir: string,
  requestedPath: string
): string | null {
  // Ensure adminStaticRoot is absolute and normalized
  const absAdminStaticRoot = path.resolve(adminStaticRoot);
  // Build absolute path for user's root
  const userAbsoluteRoot = path.resolve(absAdminStaticRoot, userRootDir);
  // Build the full requested path
  const requestFullPath = path.resolve(userAbsoluteRoot, requestedPath);

  // Normalize paths to prevent traversal tricks
  const normalizedAdminRoot = path.normalize(absAdminStaticRoot) + path.sep;
  const normalizedUserRoot = path.normalize(userAbsoluteRoot) + path.sep;
  const normalizedRequestPath = path.normalize(requestFullPath) + path.sep;

  // First check that user root is within admin root
  // This ensures the configured user root doesn't escape the main storage
  if (!normalizedUserRoot.startsWith(normalizedAdminRoot)) {
    return null; // User root is outside admin root
  }

  // Then check that the requested path starts with user's root
  // This prevents path traversal escaping the user's restricted area
  if (!normalizedRequestPath.startsWith(normalizedUserRoot)) {
    return null; // Path traversal attempt
  }

  // For the actual file path, we don't need the trailing separator
  return requestFullPath;
}
