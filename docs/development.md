# 开发文档

## 开发环境准备

- Node.js 16+
- pnpm 包管理器
- TypeScript 基础知识

## 获取源码

```bash
git clone <repository-url>
cd ark-pan
pnpm install
```

## 项目架构

```
cli.ts
  ↓
src/app.ts ← 创建 Express 应用
  ↓
src/config.ts ← 解析配置
  ↓
src/middleware/auth.ts ← 认证中间件
src/middleware/directory.ts ← 目录浏览 + 注入上传按钮
src/routes/upload.ts ← 文件上传路由
```

### 模块说明

**cli.ts**
- CLI 入口文件
- 创建应用并启动监听

**src/app.ts**
- `createApp()` 函数创建 Express 应用
- 按顺序注册中间件和路由

**src/config.ts**
- 从命令行参数、环境变量、.env 文件解析配置
- 提供默认值

**src/middleware/auth.ts**
- 使用 `express-basic-auth` 实现 Basic Auth
- 从配置读取用户名密码

**src/middleware/directory.ts**
- 组合 `express.static` 和 `serve-index`
- 通过拦截 `res.end` 在目录列表中注入"上传文件"按钮

**src/routes/upload.ts**
- GET `/upload` 显示上传表单
- POST `/upload` 使用 multer 处理文件上传
- 上传完成后重定向回目录

## 开发工作流

### 构建

```bash
pnpm run build
```

使用 Rolldown 将 TypeScript 编译打包到 `dist/cli.js`。

### 运行测试

```bash
pnpm run test
```

运行 Jest 单元测试。

### 开发模式

目前需要手动构建后运行：

```bash
pnpm run build && pnpm start
```

## 代码风格

- 使用 TypeScript
- 模块化设计，每个模块职责单一
- 遵循 Express 中间件约定

## 添加新功能

### 添加新路由

在 `src/routes/` 创建新的路由文件，然后在 `src/app.ts` 中注册：

```typescript
import newRoutes from './routes/new-route.ts';
app.use(newRoutes);
```

### 添加新中间件

在 `src/middleware/` 创建中间件文件，导出创建函数，然后在 `src/app.ts` 使用。

## 打包发布

```bash
# 构建
pnpm run build

# 打包
npm pack

# 发布到 npm
npm publish
```

## 调试

### 查看日志

Ark Pan 启动时会输出配置信息：

```
🚀 Ark Pan running on http://127.0.0.1:8090
📂 Serving files from: /path/to/files
🔐 Credentials: admin / ******
📤 Upload feature enabled
📏 Max file size: 10GB
```

### 调试模式

可以使用 node-inspector 或 VS Code 调试：

```bash
node --inspect dist/cli.js
```

## 常见问题

### 为什么修改后需要重新构建？

因为项目使用 TypeScript 开发，通过 Rolldown 打包到单个文件，需要编译才能运行。

### 如何修改上传文件大小限制？

在 `.env` 或环境变量中设置 `MAX_FILE_SIZE`，单位是字节。

### 目录列表的 HTML 在哪里修改？

`src/middleware/directory.ts` 中通过拦截 `serve-index` 的输出来注入 HTML，你可以修改那里的注入逻辑。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
