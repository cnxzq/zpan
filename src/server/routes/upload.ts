import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { ZpanConfig } from '../../config/schema';
import type { Request, Response } from 'express';

const router = express.Router();

/**
 * Create upload API routes with the given config
 */
export default function createUploadRoutes(config: ZpanConfig): express.Router {
  // Configure multer storage
  const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
      const uploadPath = path.join(config.staticRoot, req.body.dir || '');
      // Ensure directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
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
  router.post('/api/upload', upload.array('file'), (req: Request, res: Response) => {
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
