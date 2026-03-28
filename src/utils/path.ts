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
    // First look for dist/public (built version with version injected)
    const distCandidate = path.join(currentDir, 'dist', 'public');
    const distIndexPath = path.join(distCandidate, 'index.html');
    if (fs.existsSync(distIndexPath)) {
      return distCandidate;
    }
    // Then look for original public (development mode)
    const candidate = path.join(currentDir, 'public');
    const indexPath = path.join(candidate, 'index.html');
    if (fs.existsSync(indexPath)) {
      return candidate;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached root, stop searching
      break;
    }
    currentDir = parentDir;
  }

  // If still not found, try cwd/dist/public first
  const distFallback = path.join(process.cwd(), 'dist', 'public');
  const distIndexPath = path.join(distFallback, 'index.html');
  if (fs.existsSync(distIndexPath)) {
    return distFallback;
  }

  // Fall back to cwd/public
  const fallback = path.join(process.cwd(), 'public');
  return fallback;
}

/**
 * Get the path to index.html
 */
export function getIndexHtmlPath(): string {
  return path.join(getPublicPath(), 'index.html');
}
