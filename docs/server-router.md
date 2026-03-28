# ZPan Server Router Documentation

完整的 ZPan 后端路由结构文档。

## 整体架构

- **前后端分离**：前端静态文件直接由 Express 静态服务，后端只处理 API
- **支持子路径部署**：通过 `baseUrl` 配置支持部署到子路径（如 `/zpan`）
- **认证**：所有用户文件和 API 需要认证，前端静态文件和登录 API 不需要认证

---

## 路由总表

`basePath = config.baseUrl || ''`

| 路由 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `**` | GET | 否 | 前端静态文件 (HTML/CSS/JS) |
| `${basePath}`\* | GET | 否 | 前端静态文件（当配置 baseUrl 时也提供） |
| `${basePath}/api/config` | GET | 否 | 获取公开配置（baseUrl、name） |
| `${basePath}/api/auth/status` | GET | 否 | 检查登录状态 |
| `${basePath}/api/auth/login` | POST | 否 | 登录认证 |
| `${basePath}/api/auth/logout` | GET | 是 | 退出登录 |
| `${basePath}/api/list` | GET | 是 | 列出目录文件 |
| `${basePath}/api/upload` | POST | 是 | 上传文件 |
<<<<<<< HEAD
| `${basePath}/api/thumbnail` | GET | 是 | 获取图片缩略图 |
=======
| `${basePath}/thumbnail` | GET | 是 | 获取图片缩略图 |
>>>>>>> c197311a6221821dd48413ce6a4b6236329404c9
| `${basePath}/raw/*` | GET | 是 | 直接访问用户文件 |
| `*` | 任意 | - | 404 返回 JSON 错误 |

---

## 路由注册顺序

```
src/server/app.ts:

1. **Cookie 全局中间件
   - Trust proxy 信任代理（用于正确检测 HTTPS）
   - Cookie session 会话管理
   - JSON 解析
   - urlencoded 表单解析

2. **前端静态文件（无需认证）
   - `app.use(express.static(frontendPublicPath, { index: 'index.html' }))`
   - 如果配置 baseUrl，额外挂载到 `${config.baseUrl`

3. **登录路由（无需认证）
   - `app.use([basePath], loginRouter)`

4. **公开配置端点
   - `app.get(${basePath}/api/config)`

5. **认证中间件
   - `app.use(authMiddleware)` - 所有后续路由都需要认证

6. **后端 API（需要认证）
   - `app.use(${basePath}/api, createApiRoutes(config))`
<<<<<<< HEAD
   - `app.use(${basePath}/api, thumbnailRouter)`
=======
   - `app.use(basePath, thumbnailRouter)`
>>>>>>> c197311a6221821dd48413ce6a4b6236329404c9
   - `app.use(basePath, uploadRouter)`

7. **用户文件静态服务（需要认证）
   - `app.use(${basePath}/raw, userStaticMiddleware)`

8. **404 处理
   - 所有不存在的请求返回 404 JSON
```

---

## 详细路由说明

### 公开端点（无需认证）

#### `GET ${basePath}/api/config`

返回公开配置信息，供前端初始化使用。

**响应示例：**
```json
{
  "baseUrl": "/zpan",
  "name": "My ZPan"
}
```

---

### 认证相关端点

#### `GET ${basePath}/api/auth/status`

检查当前用户登录状态。

**响应示例：**
```json
{
  "loggedIn": true
}
```

#### `POST ${basePath}/api/auth/login`

Body:
```json
{
  "username": "your-username",
  "password": "your-password"
}
```

**成功响应：**
```json
{
  "success": true
}
```

**失败响应：**
```json
{
  "success": false,
  "error": "用户名或密码错误"
}
```

#### `GET ${basePath}/api/auth/logout`

清除会话，退出登录。

**响应：**
```json
{
  "success": true
}
```

---

### 文件管理 API（需要认证）

#### `GET ${basePath}/api/list`

查询参数：`?dir=/path/to/dir`，空表示根目录。

列出指定目录下的所有文件和子目录。

**响应示例：**
```json
[
  {
    "name": "documents",
    "size": 4096,
    "mtimeMs": 1672531200000,
    "isDirectory": true
  },
  {
    "name": "photo.jpg",
    "size": 1024000,
    "mtimeMs": 1672531200000,
    "isDirectory": false
  }
]
```

文件会排序：**目录在前，文件按字母排序在后**。

---

#### `POST ${basePath}/api/upload`

Form 表单参数：
- `dir` - 目标目录（可选，默认为根目录）
- `file[]` - 多个文件

**响应示例：**
```json
{
  "success": true,
  "files": ["photo.jpg", "document.pdf"],
  "currentDir": "photos"
}
```

---

### 缩略图（需要认证）

<<<<<<< HEAD
#### `GET ${basePath}/api/thumbnail`
=======
#### `GET ${basePath}/thumbnail`
>>>>>>> c197311a6221821dd48413ce6a4b6236329404c9

查询参数：`?path=/path/to/image.jpg`

生成并返回图片缩略图：
- 尺寸：最大 200x200（保持宽高比，不放大）
- 格式：WebP，质量 80%
- 缓存：生成后缓存一年，下次直接返回缓存

---

### 用户文件直接访问（需要认证）

#### `GET ${basePath}/raw/*`

直接返回 `config.staticRoot` 目录下的用户文件。

示例：
- `GET `${basePath}/raw/photo.jpg` → 返回 `${staticRoot}/photo.jpg
- `GET `${basePath}/raw/documents/report.pdf` → 返回 `${staticRoot}/documents/report.pdf`

缓存策略：禁用缓存，确保上传后立即可见。

---

## 中间件顺序说明

| 顺序 | 中间件 | 认证要求 |
|------|--------|----------|
| 1 | Cookie Session | 无 |
| 2 | JSON 解析 | 无 |
| 3 | 前端静态文件 | 无 |
| 4 | 登录路由 | 无 |
| 5 | 公开配置 | 无 |
| 6 | **Auth 认证检查** | - |
<<<<<<< HEAD
| 7 | API 所有后端 API (包括 /api/thumbnail) | 需要 |
| 8 | 上传 | 需要 |
| 9 | 用户文件 | 需要 |
| 10 | 404 | - |
=======
| 7 | API 所有后端 API | 需要 |
| 8 | 缩略图 | 需要 |
| 9 | 上传 | 需要 |
| 10 | 用户文件 | 需要 |
| 11 | 404 | - |
>>>>>>> c197311a6221821dd48413ce6a4b6236329404c9

**关键点：** 认证中间件在静态文件之后注册，这样未登录用户也可以正常访问登录页面和前端资源。

---

## baseUrl 配置示例

### 不配置 baseUrl（`baseUrl = ""`：

```
/                   → index.html (前端)
/api/config         → 公开配置
/api/auth/login    → 登录 API
/api/list          → 列出目录
<<<<<<< HEAD
/api/thumbnail?path=photo.jpg → 缩略图
/raw/photo.jpg    → 用户文件
=======
/raw/photo.jpg    → 用户文件
/thumbnail?path=photo.jpg → 缩略图
>>>>>>> c197311a6221821dd48413ce6a4b6236329404c9
```

### 配置 baseUrl = "/zpan"：

```
/zpan              → index.html (前端)
/zpan/index.html   → index.html (前端)
/zpan/api/config   → 公开配置
/zpan/api/auth/login → 登录 API
/zpan/api/list     → 列出目录
<<<<<<< HEAD
/zpan/api/thumbnail?path=photo.jpg → 缩略图
/zpan/raw/photo.jpg → 用户文件
=======
/zpan/raw/photo.jpg → 用户文件
/zpan/thumbnail?path=photo.jpg → 缩略图
>>>>>>> c197311a6221821dd48413ce6a4b6236329404c9
```

---

## 认证中间件

认证中间件 `authMiddleware` 作用：
1. 检查会话中 `req.session.loggedIn 是否为 true
2. 如果未登录，返回 401 Unauthorized JSON 响应
3. 如果已登录，调用 next() 继续处理
