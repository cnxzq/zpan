import express from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import type { ZpanConfig } from '../../config/schema';

const router = express.Router();

/**
 * Create thumbnail routes
 */
export default function createThumbnailRoutes(config: ZpanConfig): express.Router {
  // Thumbnail cache directory: .zpan/thumbnails in the server root
  const getCacheDir = (): string => {
    return path.resolve(process.cwd(), '.zpan', 'thumbnails');
  };

  // Ensure cache directory exists
  const cacheDir = getCacheDir();
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Get cached thumbnail path
  function getCachePath(filePath: string): string {
    // Create a hash based on the full file path to avoid collisions
    const hash = Buffer.from(filePath).toString('base64url');
    return path.join(getCacheDir(), `${hash}.webp`);
  }

  // Check if file is an image
  function isImage(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
  }

  // Serve thumbnail
  router.get('/thumbnail', (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath || !isImage(filePath)) {
      return res.status(400).send('Invalid file path');
    }

    const fullPath = path.resolve(config.staticRoot, filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).send('File not found');
    }

    const cachePath = getCachePath(fullPath);

    // If cached, serve directly
    if (fs.existsSync(cachePath)) {
      res.sendFile(cachePath, { maxAge: 31536000000 }); // cache for 1 year
      return;
    }

    // Generate thumbnail: 200x200, maintain aspect ratio, fit inside
    sharp(fullPath)
      .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(cachePath)
      .then(() => {
        res.sendFile(cachePath, { maxAge: 31536000000 });
      })
      .catch((error) => {
        console.error('Failed to generate thumbnail:', error);
        res.status(500).send('Failed to generate thumbnail');
      });
  });

  return router;
}
