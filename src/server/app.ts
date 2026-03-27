import express from 'express';
import cookieSession from 'cookie-session';
import path from 'path';
import { authMiddleware } from './auth';
import { getIndexHtmlPath } from '../utils/path';
import createLoginRoutes from './routes/login';
import createUploadRoutes from './routes/upload';
import createThumbnailRoutes from './routes/thumbnail';
import createApiRoutes from './routes/api';
import type { ZpanConfig } from '../config/schema';

/**
 * Create Express app for ZPan with the given configuration
 *
 * Architecture: Frontend-backend separation
 * - Backend only handles /api/** APIs
 * - Frontend static files are directly served from /public
 * - Root / serves index.html from public
 */
export function createServer(config: ZpanConfig): express.Express {
  const app = express();

  // Trust proxy when running behind reverse proxy (Nginx, etc.)
  // Required for correct secure cookie detection when SSL is terminated at proxy
  app.set('trust proxy', 1);

  // Cookie session must come before authentication
  app.use(cookieSession({
    name: config.sessionName,
    keys: [config.sessionSecret],
    httpOnly: true,
    sameSite: 'lax',
    // Auto-detect secure based on trust proxy
    // When behind proxy, app.set('trust proxy', 1) makes this work correctly
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }));

  // Parse JSON
  app.use(express.json());
  // Parse urlencoded forms
  app.use(express.urlencoded({ extended: true }));

  // ========== Frontend static files ==========
  // Frontend static files (index.html, JS/CSS) DO NOT require authentication
  // Even unauthenticated users need to load the login page
  const frontendPublicPath = path.dirname(getIndexHtmlPath());
  app.use(express.static(frontendPublicPath));
  if (config.baseUrl) {
    app.use(config.baseUrl, express.static(frontendPublicPath));
  }

  // Login routes - no authentication required
  if (config.baseUrl) {
    app.use(config.baseUrl, createLoginRoutes(config));
  } else {
    app.use(createLoginRoutes(config));
  }

  // Public config endpoint - provides baseUrl etc. to frontend
  const configPath = config.baseUrl ? `${config.baseUrl}/api/config` : '/api/config';
  app.get(configPath, (req, res) => {
    res.json({
      baseUrl: config.baseUrl,
      name: config.name,
    });
  });

  // Authentication middleware - after static files, before APIs/user files
  app.use(authMiddleware(config));

  // ========== Backend API ==========
  // All backend APIs are under /api/** - requires authentication
  const apiPath = config.baseUrl ? `${config.baseUrl}/api` : '/api';
  app.use(apiPath, createApiRoutes(config));

  // Thumbnail routes - requires authentication
  if (config.baseUrl) {
    app.use(config.baseUrl, createThumbnailRoutes(config));
  } else {
    app.use(createThumbnailRoutes(config));
  }

  // Upload routes - requires authentication
  if (config.baseUrl) {
    app.use(config.baseUrl, createUploadRoutes(config));
  } else {
    app.use(createUploadRoutes(config));
  }

  // ========== User files static serving ==========
  // Serve user-owned files directly from configured staticRoot directory
  // Requires authentication - all user files are protected
  // Direct file downloads work normally - frontend only handles directory browsing
  // Disable cache to ensure newly uploaded files are visible immediately
  if (config.baseUrl) {
    // When baseUrl is set, user files are also under baseUrl
    // So we need to serve static files from the baseUrl path
    app.use(config.baseUrl, express.static(config.staticRoot, {
      etag: false,
      cacheControl: false,
      maxAge: 0,
    }));
  } else {
    app.use(express.static(config.staticRoot, {
      etag: false,
      cacheControl: false,
      maxAge: 0,
    }));
  }

  // SPA fallback - any non-API, non-existing file request serves index.html
  // Frontend handles client-side routing (login, browse, etc.)
  app.get('*', (req, res) => {
    res.sendFile(getIndexHtmlPath());
  });

  return app;
}

// Re-export for convenience
export * from './auth';
