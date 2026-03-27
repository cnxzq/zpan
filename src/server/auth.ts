import type { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware - checks if user is logged in
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // If already logged in, allow access
  if (req.session?.loggedIn === true) {
    next();
    return;
  }

  // Allow login page and all authentication API
  if (req.path === '/login' || req.path.startsWith('/api/auth/')) {
    next();
    return;
  }

  // For API requests, return JSON error instead of redirect
  if (req.path.startsWith('/api/')) {
    res.status(401).json({ error: 'Unauthorized', message: '需要登录才能访问' });
    return;
  }

  // For non-API page requests, redirect to login page
  res.redirect('/login');
}
