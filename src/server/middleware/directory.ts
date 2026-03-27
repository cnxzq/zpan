import serveIndex from 'serve-index';
import express from 'express';
import fs from 'fs';
import path from 'path';
import type { ZpanConfig } from '../../config/schema';

/**
 * Check if file is an image
 */
export function isImage(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
}

import type { RequestHandler } from 'express';

/**
 * Create directory middleware with custom HTML injection for grid layout and upload button
 */
export function createDirectoryMiddleware(config: ZpanConfig): {
  static: RequestHandler;
  directory: RequestHandler;
} {
  // Static file serving - disable cache to ensure newly uploaded files are visible immediately
  const staticMiddleware = express.static(config.staticRoot, {
    etag: false,
    cacheControl: false,
    maxAge: 0,
  });

  // Directory browsing with custom HTML injection
  const directoryMiddleware = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // Only process directories
    const fullPath = path.join(config.staticRoot, req.path);
    try {
      const stat = fs.statSync(fullPath);
      if (!stat.isDirectory()) {
        // Not a directory, let express.static handle it
        return next();
      }
    } catch (e) {
      return next();
    }

    // Get layout from query string, default to grid
    const layout = req.query.layout === 'list' ? 'list' : 'grid';
    const dir = req.path.replace(/\?.*$/, '').replace(/\/$/, '');
    const currentDir = dir ? dir.substring(1) : '';
    const currentPath = currentDir ? `${currentDir}/` : '';

    // Create a custom response accumulator to capture all output
    let html = '';

    // Save original methods
    const originalWrite = res.write;
    const originalEnd = res.end;
    const originalSetHeader = res.setHeader;

    // Intercept to capture output
    res.write = function (chunk: any) {
      if (typeof chunk === 'string') {
        html += chunk;
      } else if (Buffer.isBuffer(chunk)) {
        html += chunk.toString('utf-8');
      }
      return true;
    } as any;

    // @ts-ignore - We know what we're doing
    res.end = function (chunk?: any) {
      if (chunk) {
        if (typeof chunk === 'string') {
          html += chunk;
        } else if (Buffer.isBuffer(chunk)) {
          html += chunk.toString('utf-8');
        }
      }

      // Restore original methods
      res.write = originalWrite;
      res.end = originalEnd;
      res.setHeader = originalSetHeader;

      if (!html.includes('ul#files')) {
        // Not the directory listing we expect, send as-is
        res.send(html);
        return;
      }

      // Add custom CSS, layout toggle, and upload button
      const extraCSS = `
<style>
  .layout-toggle { margin: 10px 0 15px 0; text-align: right; }
  .layout-toggle button {
    padding: 6px 12px;
    margin-left: 8px;
    border: 1px solid #ddd;
    background: #f5f5f5;
    cursor: pointer;
    border-radius: 4px;
  }
  .layout-toggle button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }

  /* Grid layout */
  body.layout-grid ul#files {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    padding: 10px 0;
  }
  body.layout-grid ul#files li {
    display: block;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #eee;
    background: #fafafa;
    text-align: center;
  }
  body.layout-grid ul#files li:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  body.layout-grid ul#files li .thumbnail {
    width: 160px;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
  }
  body.layout-grid ul#files li .thumbnail img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  body.layout-grid ul#files li .filename {
    word-break: break-all;
    font-size: 13px;
    line-height: 1.3;
  }
  body.layout-grid ul#files li a {
    text-decoration: none;
    color: #333;
  }
  body.layout-grid ul#files li a:hover {
    text-decoration: none;
  }
  /* Hide default icon in grid mode */
  body.layout-grid ul#files li img:first-child {
    display: none;
  }
</style>
`;

      const layoutToggle = `
<div class="layout-toggle">
  <button class="${layout === 'list' ? '' : 'active'}" onclick="window.location.search='?layout=grid'">📷 Grid</button>
  <button class="${layout === 'list' ? 'active' : ''}" onclick="window.location.search='?layout=list'">📋 List</button>
</div>
`;

      const uploadBtn = `<div style="margin: 15px 0;"><a href="/upload?dir=${currentDir}" style="display: inline-block; background: #4CAF50; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">📤 上传文件</a></div>`;

      // Inject CSS and layout toggle before </head> and after h1
      html = html.replace('</head>', `${extraCSS}\n</head>`);
      html = html.replace('</h1>', `</h1>\n${layoutToggle}\n${uploadBtn}`);
      html = html.replace('<body>', `<body class="layout-${layout}">`);

      // If grid layout, add thumbnails for images
      if (layout === 'grid') {
        // Inject thumbnail container for image files
        // serve-index outputs: <li><a href="filename"><img src="/icons/image.png" alt="[IMG]"> filename</a></li>
        // Use a more flexible regex that matches any content inside <a>
        html = html.replace(/<li>([\s\S]*?)<\/li>/gi, (match: string, content: string) => {
          // Skip if already replaced
          if (match.includes('class="thumbnail"')) return match;

          // Extract href from <a> tag
          const hrefMatch = content.match(/<a\s+href="([^"]+)"/i);
          if (!hrefMatch) return match;

          const filename = hrefMatch[1];
          if (isImage(filename)) {
            const thumbnailUrl = `/thumbnail?path=${currentPath}${encodeURIComponent(filename)}`;
            return `
<li>
  <a href="${currentPath}${filename}">
    <div class="thumbnail">
      <img src="${thumbnailUrl}" alt="${filename}">
    </div>
    <div class="filename">${filename}</div>
  </a>
</li>
`.trim();
          }
          return match;
        });
      }

      // Remove Content-Length since we modified content
      res.removeHeader('Content-Length');

      // Send modified HTML
      res.send(html);
    } as any;

    // Let serve-index generate the base HTML
    serveIndex(config.staticRoot, { icons: layout === 'list' })(req, res, next);
  };

  return {
    static: staticMiddleware,
    directory: directoryMiddleware,
  };
}
