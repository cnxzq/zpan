import express from 'express';
import fs from 'fs';
import path from 'path';
import type { ZpanConfig } from '../../config/schema';
import type { FileInfo } from '../../storage';

const router = express.Router();

/**
 * Create API routes with the given config
 */
export default function createApiRoutes(config: ZpanConfig): express.Router {
  // List directory
  router.get('/list', (req: express.Request, res: express.Response) => {
    const dir = req.query.dir as string || '';
    const fullPath = path.join(config.staticRoot, dir);

    try {
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'Directory not found' });
      }

      const stat = fs.statSync(fullPath);
      if (!stat.isDirectory()) {
        // If it's a file, let express.static handle it
        return res.status(400).json({ error: 'Not a directory' });
      }

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

      res.json(fileInfos);
    } catch (error) {
      console.error('Failed to list directory:', error);
      res.status(500).json({ error: 'Failed to list directory' });
    }
  });

  return router;
}
