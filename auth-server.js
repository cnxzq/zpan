#!/usr/bin/env node
require('dotenv').config();
const express = require('express');
const basicAuth = require('express-basic-auth');
const serveIndex = require('serve-index');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(STATIC_ROOT, req.query.dir || '');
    // 确保目录存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // 使用原始文件名
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// 解析表单数据
app.use(express.urlencoded({ extended: true }));

// 上传页面
app.get('/upload', (req, res) => {
  const currentDir = req.query.dir || '';
  const dir = (currentDir || '').replace(/^\/|\/$/g, '');
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ark Pan - 上传文件</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #333; }
    .upload-form { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    input[type="file"] { margin: 10px 0; display: block; }
    input[type="submit"] { background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    input[type="submit"]:hover { background: #1976D2; }
    .back-link { margin-top: 20px; display: inline-block; }
  </style>
</head>
<body>
  <h1>📤 上传文件到 Ark Pan</h1>
  <p>当前目录: ${currentDir || '/'}</p>
  <div class="upload-form">
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="hidden" name="dir" value="${dir}">
      <input type="file" name="file" multiple required>
      <input type="submit" value="开始上传">
    </form>
  </div>
  <a href="${dir ? '/' + dir : '/'}" class="back-link">← 返回文件列表</a>
</body>
</html>
  `;
  res.send(html);
});

// 处理文件上传
app.post('/upload', upload.array('file'), (req, res) => {
  const currentDir = req.body.dir || '';
  const files = req.files.map(f => f.originalname);
  const dir = (currentDir || '').replace(/^\/|\/$/g, '');
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>上传完成 - Ark Pan</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
    .success { color: #2E7D32; background: #E8F5E9; padding: 15px; border-radius: 8px; }
    ul { line-height: 1.6; }
    .back-link { margin-top: 20px; display: inline-block; }
  </style>
</head>
<body>
  <h1>✅ 上传完成</h1>
  <div class="success">
    <p>成功上传 ${files.length} 个文件:</p>
    <ul>
      ${files.map(f => `<li>${f}</li>`).join('')}
    </ul>
  </div>
  <a href="${dir ? '/' + dir : '/'}" class="back-link">← 返回文件列表</a>
  <a href="/upload?dir=${dir}" class="back-link">继续上传 →</a>
</body>
</html>
  `;
  res.send(html);
});

// 静态文件服务 + 目录浏览
app.use(express.static(STATIC_ROOT));
app.use('/', serveIndex(STATIC_ROOT, { 
  icons: true,
  template: function (vars, callback) {
    // 默认模板使用内置的 HTML 文件，我们读取后修改注入上传按钮
    const fs = require('fs');
    const path = require('path');
    fs.readFile(path.join(__dirname, 'node_modules', 'serve-index', 'public', 'directory.html'), 'utf8', (err, data) => {
      if (err) {
        return callback(err);
      }
      const dir = (vars.currentDir || '').replace(/^\/|\/$/g, '');
      const uploadBtn = `<p style="margin: 10px 0;"><a href="/upload?dir=${dir}" style="display: inline-block; background: #4CAF50; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">📤 上传文件</a></p>`;
      const modified = data.replace('<div id="content">', `<div id="content">${uploadBtn}`);
      callback(null, modified);
    });
  }
}));

app.listen(PORT, HOST, () => {
  console.log(`🚀 Ark Pan running on http://${HOST}:${PORT}`);
  console.log(`📂 Serving files from: ${STATIC_ROOT}`);
  console.log(`🔐 Credentials: ${USERNAME} / ${PASSWORD}`);
  console.log(`📤 Upload feature enabled`);
});
