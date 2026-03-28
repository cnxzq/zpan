import express from 'express';
import cookieSession from 'cookie-session';
import path from 'path';
import fs from 'fs';
import { authMiddleware, attachUserMiddleware } from './auth';
import { getIndexHtmlPath, resolveAndValidatePath } from '@/utils/path';
import createLoginRoutes from './routes/login';
import createUploadRoutes from './routes/upload';
import createThumbnailRoutes from './routes/thumbnail';
import createApiRoutes from './routes/api';
import createAdminRoutes from './routes/admin';
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
  // When running behind reverse proxy (Nginx, etc.), trust proxy is enabled
  // The 'secure' setting is determined dynamically by Express based on X-Forwarded-Proto
  // This works correctly for both HTTP and HTTPS regardless of NODE_ENV
  appDebug('cookie session secure: dynamic (based on X-Forwarded-Proto)');
  app.use((req, res, next) => {
    // Determine if this request is secure dynamically
    // req.secure is automatically set correctly when trust proxy is enabled
    const secureCookie = req.secure;
    cookieSession({
      name: config.sessionName,
      keys: [config.sessionSecret],
      httpOnly: true,
      sameSite: 'lax',
      secure: secureCookie,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })(req, res, next);
  });

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

  // Attach user info to request from session
  app.use(attachUserMiddleware(config));

  // ========== Backend API ==========
  // All backend APIs are under /api/** - requires authentication
  const apiRouter = createApiRoutes(config);
  app.use(basePath, apiRouter);
  appDebug('mounted API router at: %s', basePath);

  // Thumbnail routes - requires authentication
  const thumbnailRouter = createThumbnailRoutes(config);
  app.use(basePath, thumbnailRouter);
  appDebug('mounted thumbnail router at: %s', basePath);

  // Upload routes - requires authentication
  const uploadRouter = createUploadRoutes(config);
  app.use(basePath, uploadRouter);
  appDebug('mounted upload router at: %s', basePath);

  // Admin user management routes - requires authentication and admin permission
  const adminRouter = createAdminRoutes(config);
  app.use(basePath, adminRouter);
  appDebug('mounted admin router at: %s', basePath);

  // ========== User files static serving ==========
  // Serve user-owned files through dynamic route with permission checking
  // Requires authentication - all user files are protected
  // Direct file downloads work normally - frontend only handles directory browsing
  app.get(`${basePath}/raw/*`, (req: express.Request, res: express.Response) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract the requested path after /raw/
    const rawPath = (req.params as any)[0];
    const userRootDir = (req as any).user.rootDir;

    // Validate the requested path is within user's root directory
    const validatedPath = resolveAndValidatePath(config.staticRoot, userRootDir, rawPath);
    if (!validatedPath) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    if (!fs.existsSync(validatedPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Disable cache to ensure newly uploaded files are visible immediately
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send the file
    res.sendFile(validatedPath, {
      etag: false,
    });
  });
  appDebug('mounted user files dynamic route at: %s/raw/*', basePath);
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
