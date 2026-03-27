import express from 'express';
import cookieSession from 'cookie-session';
import { authMiddleware } from './middleware/auth.js';
import { createDirectoryMiddleware } from './middleware/directory.js';
import uploadRoutes from './routes/upload.js';
import loginRoutes from './routes/login.js';
import config from './config.js';

export function createApp() {
  const app = express();

  // Cookie session 必须在认证之前
  app.use(cookieSession({
    name: config.SESSION_NAME,
    keys: [config.SESSION_SECRET],
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }));

  // 解析表单
  app.use(express.urlencoded({ extended: true }));

  // 登录路由
  app.use(loginRoutes);

  // 认证中间件
  app.use(authMiddleware);

  // 上传路由
  app.use(uploadRoutes);

  // 静态文件 + 目录浏览
  const { static: staticMiddleware, directory: directoryMiddleware } = createDirectoryMiddleware();
  app.use(staticMiddleware);
  app.use(directoryMiddleware);

  return app;
}
