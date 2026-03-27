import type { Request, Response, NextFunction } from 'express';
import type { ZpanConfig } from '../config/schema';
import { getIndexHtmlPath } from '../utils/path';

/**
 * Authentication middleware - checks if user is logged in
 * For SPA architecture:
 * - API requests: return 401 JSON if not logged in
 * - Page requests: serve index.html, frontend handles login modal
 */
export function authMiddleware(config: ZpanConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // If already logged in, allow access
    if (req.session?.loggedIn === true) {
      next();
      return;
    }

    // Always allow authentication API
    const authApiPrefix = config.baseUrl ? `${config.baseUrl}/api/auth/` : '/api/auth/';
    const apiPrefix = config.baseUrl ? `${config.baseUrl}/api/` : '/api/';

    if (req.path.startsWith(authApiPrefix)) {
      next();
      return;
    }

    // For API requests (other than auth), return JSON error instead of redirect
    if (req.path.startsWith(apiPrefix)) {
      res.status(401).json({ error: 'Unauthorized', message: '需要登录才能访问' });
      return;
    }

    // For all non-API page requests (including any SPA route), just serve index.html
    // Frontend will check auth status and show login modal if needed
    res.sendFile(getIndexHtmlPath());
  };
}
