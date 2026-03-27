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

  // Not logged in, redirect to login page
  res.redirect('/login');
}
