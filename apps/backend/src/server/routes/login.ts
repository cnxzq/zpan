import express from 'express';
import type { ZpanConfig } from '../../config/schema';

/**
 * Create authentication API routes
 * All page rendering is done by frontend SPA - backend only provides JSON APIs
 */
export default function createLoginRoutes(config: ZpanConfig): express.Router {
  const router = express.Router();

  // GET /api/auth/status - Check login status
  router.get('/api/auth/status', (req, res) => {
    res.json({
      loggedIn: req.session?.loggedIn === true,
      username: req.session?.username,
      role: req.session?.username && config.users ?
        config.users.find(u => u.username === req.session.username)?.role :
        undefined,
    });
  });

  // POST /api/auth/login - Handle login authentication
  router.post('/api/auth/login', express.json(), (req, res) => {
    const { username, password } = req.body;

    // Find user by username
    const user = config.users?.find(u => u.username === username);

    // Validate credentials
    if (user && user.password === password) {
      if (req.session) {
        req.session.loggedIn = true;
        req.session.username = username;
      }
      return res.json({
        success: true,
        role: user.role,
      });
    }

    res.json({ success: false, error: '用户名或密码错误' });
  });

  // GET /api/auth/logout - Logout
  router.get('/api/auth/logout', (req, res) => {
    if (req.session) {
      req.session = null;
    }
    res.json({ success: true });
  });

  // Note: /login page is handled by frontend SPA via client-side routing
  return router;
}
