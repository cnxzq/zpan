const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const router = express.Router();

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(config.STATIC_ROOT, req.body.dir || '');
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

const upload = multer({ 
  storage: storage,
  limits: { fileSize: config.MAX_FILE_SIZE }
});

// 上传页面
router.get('/upload', (req, res) => {
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
router.post('/upload', upload.array('file'), (req, res) => {
  const currentDir = req.body.dir || '';
  const dir = (currentDir || '').replace(/^\/|\/$/g, '');
  const files = req.files.map(f => f.originalname);
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

module.exports = router;
