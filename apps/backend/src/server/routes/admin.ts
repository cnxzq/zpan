import express from 'express';
import fs from 'fs';
import path from 'path';
import type { ZpanConfig, User } from '../../config/schema';
import { saveConfig } from '../../config/loader';
import { resolveAndValidatePath } from '../../utils/path';
import { requireAdmin } from '../auth';

/**
 * Create admin API routes for user management
 */
export default function createAdminRoutes(config: ZpanConfig): express.Router {
  const router = express.Router();
  const apiPrefix = config.baseUrl + '/api/admin';

  // GET /api/admin/users - Get list of users (without passwords)
  router.get(apiPrefix + '/users', requireAdmin, (req, res) => {
    if (!config.users) {
      return res.json([]);
    }

    // Don't return password hashes/values to client
    const safeUsers = config.users.map(u => ({
      username: u.username,
      role: u.role,
      permission: u.permission,
      rootDir: u.rootDir,
    }));

    res.json(safeUsers);
  });

  // GET /api/admin/users/:username - Get single user (without password)
  router.get(apiPrefix + '/users/:username', requireAdmin, (req, res) => {
    const { username } = req.params;
    const user = config.users?.find(u => u.username === username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't return password
    res.json({
      username: user.username,
      role: user.role,
      permission: user.permission,
      rootDir: user.rootDir,
    });
  });

  // POST /api/admin/users - Create new user
  router.post(apiPrefix + '/users', express.json(), requireAdmin, (req, res) => {
    const { username, password, role, permission, rootDir } = req.body;

    // Validate input
    if (!username || !password || !role || permission === undefined || rootDir === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if username already exists
    if (config.users?.some(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Validate that user rootDir is within admin's staticRoot
    const validated = resolveAndValidatePath(config.staticRoot, rootDir, '');
    if (!validated) {
      return res.status(400).json({ error: 'rootDir must be within the main storage directory' });
    }

    const newUser: User = {
      username,
      password,
      role,
      permission,
      rootDir,
    };

    config.users?.push(newUser);

    // Auto-create user root directory
    const userRootAbs = path.resolve(config.staticRoot, rootDir);
    if (!fs.existsSync(userRootAbs)) {
      fs.mkdirSync(userRootAbs, { recursive: true });
    }

    // Save config
    const saved = saveConfig(config);
    if (!saved) {
      // Rollback
      config.users = config.users?.filter(u => u.username !== username);
      return res.status(500).json({ error: 'Failed to save configuration' });
    }

    res.json({
      success: true,
      user: {
        username: newUser.username,
        role: newUser.role,
        permission: newUser.permission,
        rootDir: newUser.rootDir,
      },
    });
  });

  // PUT /api/admin/users/:username - Update user
  router.put(apiPrefix + '/users/:username', express.json(), requireAdmin, (req, res) => {
    const { username } = req.params;
    const { password, role, permission, rootDir } = req.body;

    const userIndex = config.users?.findIndex(u => u.username === username) ?? -1;
    if (userIndex === -1 || !config.users) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingUser = config.users[userIndex];

    // Validate rootDir if provided
    if (rootDir !== undefined) {
      const validated = resolveAndValidatePath(config.staticRoot, rootDir, '');
      if (!validated) {
        return res.status(400).json({ error: 'rootDir must be within the main storage directory' });
      }
    }

    // Update user, preserve password if not provided
    config.users[userIndex] = {
      ...existingUser,
      role: role ?? existingUser.role,
      permission: permission ?? existingUser.permission,
      rootDir: rootDir ?? existingUser.rootDir,
      password: password || existingUser.password,
    };

    // Auto-create root directory if it doesn't exist
    const updatedUser = config.users[userIndex];
    const userRootAbs = path.resolve(config.staticRoot, updatedUser.rootDir);
    if (!fs.existsSync(userRootAbs)) {
      fs.mkdirSync(userRootAbs, { recursive: true });
    }

    // Save config
    const saved = saveConfig(config);
    if (!saved) {
      // Rollback
      config.users[userIndex] = existingUser;
      return res.status(500).json({ error: 'Failed to save configuration' });
    }

    res.json({
      success: true,
      user: {
        username: updatedUser.username,
        role: updatedUser.role,
        permission: updatedUser.permission,
        rootDir: updatedUser.rootDir,
      },
    });
  });

  // DELETE /api/admin/users/:username - Delete user
  router.delete(apiPrefix + '/users/:username', requireAdmin, (req, res) => {
    const { username } = req.params;

    // Can't delete yourself
    if ((req as any).user?.username === username) {
      return res.status(400).json({ error: 'Cannot delete the currently logged in user' });
    }

    if (!config.users) {
      return res.status(404).json({ error: 'User not found' });
    }

    const initialLength = config.users.length;
    config.users = config.users.filter(u => u.username !== username);

    if (config.users.length === initialLength) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure at least one admin remains
    const adminCount = config.users.filter(u => u.role === 'admin').length;
    if (adminCount === 0) {
      // Rollback
      config.users.push(config.users.find(u => u.username === username)!);
      return res.status(400).json({ error: 'Cannot delete the last admin user' });
    }

    // Save config
    const saved = saveConfig(config);
    if (!saved) {
      // Rollback would require keeping original, but we already modified - best effort
      return res.status(500).json({ error: 'Failed to save configuration' });
    }

    res.json({ success: true });
  });

  return router;
}
