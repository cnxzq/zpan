import express from 'express';
import cookieSession from 'cookie-session';
import path from 'path';
import { authMiddleware } from './auth';
import { getIndexHtmlPath } from '@/utils/path';
import createLoginRoutes from './routes/login';
import createUploadRoutes from './routes/upload';
import createThumbnailRoutes from './routes/thumbnail';
import createApiRoutes from './routes/api';
import type { ZpanConfig, ZpanConfigInit } from '@/config/schema';
import debug from 'debug'
import { normalPanConfig } from '@/config/loader';

const appDebug = debug('zpan:app')

/**
 * Create Express app for ZPan with the given configuration
 *
 * Architecture: Frontend-backend separation
 * - Backend only handles /api/** APIs
 * - Frontend static files are directly served from /public
 * - Root / serves index.html from public
 */
export function createServer(configInit: ZpanConfigInit): express.Express {
  const config = normalPanConfig(configInit)

  const app = express();

  appDebug('Creating server with config: %O', {
    name: config.name,
    port: config.port,
    host: config.host,
    baseUrl: config.baseUrl,
    staticRoot: config.staticRoot,
    username: config.username,
    realm: config.realm,
    maxFileSize: config.maxFileSize,
    sessionName: config.sessionName,
  });

  // Trust proxy when running behind reverse proxy (Nginx, etc.)
  // Required for correct secure cookie detection when SSL is terminated at proxy
  app.set('trust proxy', 1);
  appDebug('trust proxy enabled: %o', app.get('trust proxy'));

  // Cookie session must come before authentication
  const cookieSecure = process.env.NODE_ENV === 'production';
  appDebug('cookie session secure: %o', cookieSecure);
  app.use(cookieSession({
    name: config.sessionName,
    keys: [config.sessionSecret],
    httpOnly: true,
    sameSite: 'lax',
    // Auto-detect secure based on trust proxy
    // When behind proxy, app.set('trust proxy', 1) makes this work correctly
    secure: cookieSecure,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }));

  // Parse JSON
  app.use(express.json());
  // Parse urlencoded forms
  app.use(express.urlencoded({ extended: true }));

  // ========== Frontend static files ==========
  // Frontend static files (index.html, JS/CSS) DO not require authentication
  // Even unauthenticated users need to load the login page
  const frontendPublicPath = path.dirname(getIndexHtmlPath());
  const basePath = config.baseUrl || '';
  appDebug('frontend public path: %s', frontendPublicPath);
  appDebug('base path: %s', basePath || '(empty)');

  const frontendStaticMiddleware = express.static(frontendPublicPath, { index: 'index.html' });
  // Serve from basePath (for subpath deployment)
  // When deploying directly at root, basePath is empty and this works correctly
  app.use(basePath, frontendStaticMiddleware);
  appDebug('mounted frontend static at: %s', basePath || '/');

  // Login routes - no authentication required
  const loginRouter = createLoginRoutes(config);
  app.use(basePath, loginRouter);
  appDebug('mounted login router at: %s', basePath || '/');

  // Public config endpoint - provides baseUrl etc. to frontend
  app.get(`${basePath}/api/config`, (req, res) => {
    appDebug('GET %s/api/config', basePath);
    res.json({
      baseUrl: config.baseUrl,
      name: config.name,
    });
  });

  // Authentication middleware - after static files, before APIs/user files
  app.use(authMiddleware(config));

  // ========== Backend API ==========
  // All backend APIs are under /api/** - requires authentication
  app.use(`${basePath}/api`, createApiRoutes(config));
  appDebug('mounted API router at: %s/api', basePath);

  // Thumbnail routes - requires authentication
  const thumbnailRouter = createThumbnailRoutes(config);
  app.use(`${basePath}/api`, thumbnailRouter);
  appDebug('mounted thumbnail router at: %s/api', basePath);

  // Upload routes - requires authentication
  const uploadRouter = createUploadRoutes(config);
  app.use(basePath, uploadRouter);
  appDebug('mounted upload router at: %s', basePath);

  // ========== User files static serving ==========
  // Serve user-owned files directly from configured staticRoot directory
  // Requires authentication - all user files are protected
  // Direct file downloads work normally - frontend only handles directory browsing
  // Disable cache to ensure newly uploaded files are visible immediately
  const userStaticMiddleware = express.static(config.staticRoot, {
    etag: false,
    cacheControl: false,
    maxAge: 0,
    index: false,
  });
  app.use(`${basePath}/raw`, userStaticMiddleware);
  appDebug('mounted user files static at: %s/raw', basePath);
  appDebug('user files root: %s', config.staticRoot);

  // 404 handler - any non-existing request returns 404
  app.use((req, res) => {
    appDebug('404 Not Found: %s %s', req.method, req.originalUrl);
    res.status(404).json({ error: 'Not Found' });
  });

  // Log all registered routes for debugging
  if (process.env.DEBUG) {
    console.log('\n📋 [ZPan] Registered routes:');
    // @ts-ignore - Express exposes the stack
    app._router?.stack?.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
        console.log(`  ${methods} ${layer.route.path}`);
      } else if (layer.path != null && layer.path !== '') {
        if (layer.handle.name === 'expressStaticMiddleware') {
          console.log(`  STATIC ${layer.path}/*`);
        } else {
          console.log(`  USE ${layer.path}`);
        }
      }
    });
    console.log('');
  }

  appDebug('Server created successfully');
  return app;
}

// Re-export for convenience
export * from './auth';
