import express from 'express';
import type { ZpanConfig } from '../../config/schema';

const router = express.Router();

/**
 * Create authentication API routes
 * All page rendering is done by frontend SPA - backend only provides JSON APIs
 */
export default function createLoginRoutes(config: ZpanConfig): express.Router {
  // GET /api/auth/status - Check login status
  router.get('/api/auth/status', (req, res) => {
    res.json({
      loggedIn: req.session?.loggedIn === true,
    });
  });

  // POST /api/auth/login - Handle login authentication
  router.post('/api/auth/login', express.json(), (req, res) => {
    const { username, password } = req.body;

    // Validate credentials
    if (username === config.username && password === config.password) {
      if (req.session) {
        req.session.loggedIn = true;
      }
      return res.json({ success: true });
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
