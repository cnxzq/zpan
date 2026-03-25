#!/usr/bin/env node
import { createApp } from './app.js';
import config from './config.js';

const app = createApp();

app.listen(config.PORT, config.HOST, () => {
  console.log(`🚀 Ark Pan running on http://${config.HOST}:${config.PORT}`);
  console.log(`📂 Serving files from: ${config.STATIC_ROOT}`);
  console.log(`🔐 Credentials: ${config.USERNAME} / ${config.PASSWORD}`);
  console.log(`📤 Upload feature enabled`);
  console.log(`📏 Max file size: ${(config.MAX_FILE_SIZE / 1024 / 1024 / 1024).toFixed(0)}GB`);
});
