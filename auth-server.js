#!/usr/bin/env node
require('dotenv').config();
const express = require('express');
const basicAuth = require('express-basic-auth');
const serveIndex = require('serve-index');

const app = express();

// 从环境变量读取配置
const PORT = process.env.PORT || 8090;
const HOST = process.env.HOST || '127.0.0.1';
const STATIC_ROOT = process.env.STATIC_ROOT || '/root/.openclaw/workspace/zq-sh';
const USERNAME = process.env.USERNAME || 'admin';
const PASSWORD = process.env.PASSWORD || 'admin123';
const REALM = process.env.REALM || 'Ark Pan - Protected Area';

// 配置用户
const users = {};
users[USERNAME] = PASSWORD;

// 启用基础认证
app.use(basicAuth({
  users: users,
  challenge: true,
  realm: REALM
}));

// 静态文件服务 + 目录浏览
app.use(express.static(STATIC_ROOT));
app.use('/', serveIndex(STATIC_ROOT, { icons: true }));

app.listen(PORT, HOST, () => {
  console.log(`🚀 Ark Pan running on http://${HOST}:${PORT}`);
  console.log(`📂 Serving files from: ${STATIC_ROOT}`);
  console.log(`🔐 Credentials: ${USERNAME} / ${PASSWORD}`);
});
