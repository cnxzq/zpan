import type { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // If already logged in, allow access
  if (req.session?.loggedIn === true) {
    return next();
  }

  // If requesting login page, allow
  if (req.path === '/login') {
    return next();
  }

  // Not logged in, redirect to login page
  res.redirect('/login');
}
