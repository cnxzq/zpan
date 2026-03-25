import express from 'express';
import { createAuthMiddleware } from './middleware/auth.js';
import { createDirectoryMiddleware } from './middleware/directory.js';
import uploadRoutes from './routes/upload.js';
import config from './config.js';

export function createApp() {
  const app = express();

  // 基础认证
  app.use(createAuthMiddleware());

  // 解析表单
  app.use(express.urlencoded({ extended: true }));

  // 上传路由
  app.use(uploadRoutes);

  // 静态文件 + 目录浏览
  const { static: staticMiddleware, directory: directoryMiddleware } = createDirectoryMiddleware();
  app.use(staticMiddleware);
  app.use(directoryMiddleware);

  return app;
}
