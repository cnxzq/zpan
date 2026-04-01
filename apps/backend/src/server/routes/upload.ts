import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { ZpanConfig } from '../../config/schema';
import type { Request, Response } from 'express';
import { resolveAndValidatePath } from '../../utils/path';
import { requireWritePermission } from '../auth';

/**
 * Create upload API routes with the given config
 */
export default function createUploadRoutes(config: ZpanConfig): express.Router {
  const router = express.Router();

  // Configure multer storage
  const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
      try {
        const currentDir = req.body.dir || '';
        const userRootDir = req.user?.rootDir || '.';
        const validatedPath = resolveAndValidatePath(config.staticRoot, userRootDir, currentDir);

        if (!validatedPath) {
          cb(new Error('Forbidden: Path traversal detected'), '');
          return;
        }

        // Ensure directory exists
        if (!fs.existsSync(validatedPath)) {
          fs.mkdirSync(validatedPath, { recursive: true });
        }
        cb(null, validatedPath);
      } catch (error) {
          cb(error as Error, '');
        }
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
      // Fix Chinese filename encoding issues
      let originalName = file.originalname;
      try {
        originalName = decodeURIComponent(escape(originalName));
      } catch (e) {
        // If decoding fails, keep original
      }
      cb(null, originalName);
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: config.maxFileSize },
  });

  // POST /api/upload - Handle file upload (JSON API response)
  router.post(
    '/api/upload',
    requireWritePermission,
    upload.array('file'),
    (req: Request, res: Response) => {
      const currentDir = req.body.dir as string || '';
      const files = (req.files as Express.Multer.File[])?.map(f => f.originalname) || [];

      res.json({
        success: true,
      files,
      currentDir,
    });
  });

  return router;
}
