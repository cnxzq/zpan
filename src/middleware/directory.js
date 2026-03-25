const serveIndex = require('serve-index');
const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../config');

function createDirectoryMiddleware() {
  // 静态文件服务
  const staticMiddleware = express.static(config.STATIC_ROOT);

  // 目录浏览 - 注入上传按钮
  const directoryMiddleware = (req, res, next) => {
    // 只有当请求目录才需要注入
    let fullPath = path.join(config.STATIC_ROOT, req.path);
    try {
      const stat = fs.statSync(fullPath);
      if (!stat.isDirectory()) {
        // 不是目录，交给 express.static 处理
        return next();
      }
    } catch (e) {
      return next();
    }

    // 拦截 res.end 来修改 HTML 注入上传按钮
    const originalEnd = res.end;
    res.end = function(data, encoding) {
      if (data && typeof data === 'string' && data.includes('ul#files')) {
        const dir = req.path.replace(/\?.*$/, '').replace(/\/$/, '');
        const currentDir = dir ? dir.substring(1) : '';
        const uploadBtn = `<div style="margin: 15px 0;"><a href="/upload?dir=${currentDir}" style="display: inline-block; background: #4CAF50; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">📤 上传文件</a></div>`;
        data = data.replace('</h1>', `</h1>\n${uploadBtn}`);
      }
      originalEnd.call(this, data, encoding);
    };

    // 继续给 serve-index 处理
    serveIndex(config.STATIC_ROOT, { icons: true })(req, res, next);
  };

  return {
    static: staticMiddleware,
    directory: directoryMiddleware
  };
}

module.exports = { createDirectoryMiddleware };
