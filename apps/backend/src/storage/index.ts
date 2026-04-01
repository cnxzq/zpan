import fs from 'fs';
import path from 'path';

/**
 * File information for directory listing
 */
export interface FileInfo {
  name: string;
  size: number;
  mtimeMs: number;
  isDirectory: boolean;
}

/**
 * Local file storage operations
 */
export class Storage {
  constructor(
    private readonly rootDir: string
  ) {}

  /**
   * Get full absolute path for a relative path
   */
  getFullPath(relativePath: string): string {
    return path.join(this.rootDir, relativePath);
  }

  /**
   * Check if path exists
   */
  exists(relativePath: string): boolean {
    return fs.existsSync(this.getFullPath(relativePath));
  }

  /**
   * Check if path is a directory
   */
  isDirectory(relativePath: string): boolean {
    const fullPath = this.getFullPath(relativePath);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  }

  /**
   * List directory contents
   */
  listDirectory(relativePath: string): FileInfo[] {
    const fullPath = this.getFullPath(relativePath);
    const files = fs.readdirSync(fullPath);

    const fileInfos: FileInfo[] = files.map(name => {
      const filePath = path.join(fullPath, name);
      const stat = fs.statSync(filePath);
      return {
        name,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        isDirectory: stat.isDirectory(),
      };
    });

    // Sort: directories first, then files alphabetically
    fileInfos.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return fileInfos;
  }

  /**
   * Ensure directory exists
   */
  ensureDirectory(relativePath: string): void {
    const fullPath = this.getFullPath(relativePath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  /**
   * Check if file is an image
   */
  static isImage(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
  }
}
