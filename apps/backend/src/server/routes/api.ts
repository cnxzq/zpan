import express from 'express';
import fs from 'fs';
import path from 'path';
import type { ZpanConfig } from '../../config/schema';
import type { FileInfo } from '../../storage';
import { resolveAndValidatePath } from '../../utils/path';
import { requireWritePermission } from '../auth';

/**
 * Create API routes with the given config
 */
export default function createApiRoutes(config: ZpanConfig): express.Router {
  const router = express.Router();

  // List directory
  router.get('/api/list', (req: express.Request, res: express.Response) => {
    const dir = req.query.dir as string || '';

    // Get user root from request
    const userRootDir = req.user?.rootDir || '.';
    const validatedPath = resolveAndValidatePath(config.staticRoot, userRootDir, dir);

    if (!validatedPath) {
      return res.status(403).json({ error: 'Forbidden: Path traversal detected' });
    }

    try {
      if (!fs.existsSync(validatedPath)) {
        return res.status(404).json({ error: 'Directory not found' });
      }

      const stat = fs.statSync(validatedPath);
      if (!stat.isDirectory()) {
        return res.status(400).json({ error: 'Not a directory' });
      }

      const files = fs.readdirSync(validatedPath);
      const fileInfos: FileInfo[] = files.reduce((acc, name) => {
        const filePath = path.join(validatedPath, name);
        try {
          const stat = fs.statSync(filePath);
          acc.push({
            name,
            size: stat.size,
            mtimeMs: stat.mtimeMs,
            isDirectory: stat.isDirectory(),
          });
        } catch (error) {
          // Skip files/directories we don't have permission to access
          console.debug(`Skip inaccessible: ${filePath} (${(error as Error).message})`);
        }
        return acc;
      }, [] as FileInfo[]);

      // Sort: directories first, then files alphabetically
      fileInfos.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      res.json(fileInfos);
    } catch (error) {
      console.error('Failed to list directory:', error);
      res.status(500).json({ error: 'Failed to list directory' });
    }
  });

  return router;
}
