import type { Request, Response, NextFunction } from 'express';
import type { ZpanConfig } from '../config/schema';

/**
 * Authentication middleware - checks if user is logged in
 */
export function authMiddleware(config: ZpanConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // If already logged in, allow access
    if (req.session?.loggedIn === true) {
      next();
      return;
    }

    // Allow login page and all authentication API
    const loginPath = config.baseUrl ? `${config.baseUrl}/login` : '/login';
    const authApiPrefix = config.baseUrl ? `${config.baseUrl}/api/auth/` : '/api/auth/';
    const apiPrefix = config.baseUrl ? `${config.baseUrl}/api/` : '/api/';

    if (req.path === (config.baseUrl || '/') || req.path === loginPath || req.path.startsWith(authApiPrefix)) {
      next();
      return;
    }

    // For API requests, return JSON error instead of redirect
    if (req.path.startsWith(apiPrefix)) {
      res.status(401).json({ error: 'Unauthorized', message: '需要登录才能访问' });
      return;
    }

    // For non-API page requests, redirect to login page with correct baseUrl
    res.redirect(loginPath);
  };
}
