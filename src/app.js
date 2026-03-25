const express = require('express');
const { createAuthMiddleware } = require('./middleware/auth');
const { createDirectoryMiddleware } = require('./middleware/directory');
const uploadRoutes = require('./routes/upload');
const config = require('./config');

function createApp() {
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

module.exports = { createApp };
