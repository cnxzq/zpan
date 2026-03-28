import type { Request, Response, NextFunction } from 'express';
import type { ZpanConfig } from '../config/schema';
import { getIndexHtmlPath } from '../utils/path';
import debug from 'debug';

const authDebug = debug('zpan:auth');

/**
 * Authentication middleware - checks if user is logged in
 * For SPA architecture:
 * - API requests: return 401 JSON if not logged in
 * - For non-existent resources: always let it go to 404 handler
 * - Only when it's clearly a SPA page request (GET HTML) we serve index.html
 */
export function authMiddleware(config: ZpanConfig) {
  const apiPrefix = config.baseUrl ? `${config.baseUrl}/api/` : '/api/';
  const authApiPrefix = `${apiPrefix}/auth/`;
  authDebug('apiPrefix: %s, authApiPrefix: %s', apiPrefix, authApiPrefix);

  return (req: Request, res: Response, next: NextFunction): void => {
    const path = req.originalUrl;
    authDebug('auth check: %s %s, loggedIn: %o', req.method, path, req.session?.loggedIn);

    // If already logged in, allow access to everything
    // Let subsequent routing handle 404 checking - non-existent resources get 404
    if (req.session?.loggedIn === true) {
      authDebug('already logged in, allowing: %s', path);
      next();
      return;
    }

    // Always allow authentication API
    // Use req.originalUrl because it includes full path with baseUrl
    if (path.startsWith(authApiPrefix)) {
      authDebug('auth API allowed without login: %s', path);
      next();
      return;
    }

    // For API requests (other than auth), return JSON error instead of redirect
    // Use req.originalUrl because it includes full path with baseUrl
    if (path.startsWith(apiPrefix)) {
      authDebug('API request not logged in, returning 401: %s', path);
      res.status(401).json({ error: 'Unauthorized', message: '需要登录才能访问' });
      return;
    }

    // If path starts with /api/ but doesn't match correct apiPrefix (missing baseUrl),
    // it means the API route doesn't exist - let it go to 404 handler
    if (path.startsWith('/api/')) {
      authDebug('API path does not match correct prefix (%s), let 404 handler handle it', apiPrefix);
      next();
      return;
    }

    // Root path / gets index.html so that SPA can boot
    // Any other non-existent GET request is 404 (as requested)
    if (req.method === 'GET' && (path === '/' || path === config.baseUrl || path === config.baseUrl + '/')) {
      authDebug('root path request not logged in, serving index.html: %s', path);
      res.sendFile(getIndexHtmlPath());
      return;
    }

    // For all other non-existent resources (GET and non-GET), let 404 handler handle it
    authDebug('non-existent resource %s, let 404 handler handle it', path);
    next();
  };
}
