# Ark Pan

> 带基础认证的静态文件网盘，支持文件上传，完美配合 frp 内网穿透访问。

Ark Pan 是一个轻量级的静态文件网盘系统，基于 Node.js + Express 构建，可以快速搭建一个带密码保护的文件分享服务。

## ✨ 功能特性

- 📁 **静态文件托管** - 直接托管本地目录，支持浏览器下载
- 📂 **目录浏览** - 自动生成文件列表，带图标展示
- 📤 **文件上传** - 支持通过网页上传文件，默认最大支持 10GB
- 🔐 **基础认证** - 内置 Basic Auth 账号密码保护
- ⚙️ **灵活配置** - 支持命令行参数、环境变量、.env 文件
- 📡 **内网穿透友好** - 完美配合 frp 将本地服务暴露到公网
- 🚀 **轻量快速** - 启动迅速，资源占用低

## 📦 安装

### 从源码安装

```bash
git clone https://github.com/zhuguangxiang/ark-pan.git
cd ark-pan
pnpm install
pnpm run build
```

### 全局安装 (npm)

```bash
npm install -g ark-pan
```

## 🚀 快速开始

### 方式一：命令行直接启动

```bash
# 使用默认配置（端口 8090，当前目录，admin/admin123）
ark-pan

# 自定义端口和目录
ark-pan 8080 /path/to/files
```

### 方式二：使用 .env 配置

```bash
# 复制配置文件
cp .env.example .env
# 编辑修改配置
vi .env
# 启动
npm start
```

访问 `http://127.0.0.1:8090` 即可使用。

## ⚙️ 配置说明

支持三种配置方式，优先级：**命令行参数 > 环境变量 > .env > 默认值**

### 所有配置项

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `8090` | 监听端口 |
| `HOST` | `127.0.0.1` | 绑定地址 |
| `STATIC_ROOT` | 当前目录 | 静态文件根目录 |
| `USERNAME` | `admin` | 认证用户名（单用户模式） |
| `PASSWORD` | `admin123` | 认证密码（单用户模式） |
| `USERS` | - | 多用户配置，格式：`username1:password1,username2:password2`（多用户模式） |
| `REALM` | `Ark Pan - Protected Area` | 认证域名称 |
| `MAX_FILE_SIZE` | `10GB` | 最大上传文件大小 |

### 配置示例

```env
# Server
PORT=8090
HOST=0.0.0.0

# Directory
STATIC_ROOT=/home/user/files

# Auth (单用户模式)
USERNAME=myuser
PASSWORD=mypassword

# Auth (多用户模式，设置后覆盖单用户配置)
# USERS=alice:secret123,bob:password456,charlie:mypassword

# Upload
MAX_FILE_SIZE=10737418240
```

## 📡 frp 内网穿透配置

配合 frp 将本地服务暴露到公网：

**frpc.toml 示例:**

```toml
serverAddr = "your-server-ip"
serverPort = 7000
auth.method = "token"
auth.token = "your-token"

[[proxies]]
name = "ark-pan"
type = "http"
localIP = "127.0.0.1"
localPort = 8090
customDomains = ["pan.yourdomain.com"]
```

详细配置说明见 [文档](./docs/frp-setup.md)。

## 📖 完整文档

详细文档请查看 [docs](./docs/) 目录：

- [文档索引](./docs/README.md) - 所有文档导航
- [项目介绍](./docs/introduction.md) - 项目介绍和使用场景
- [安装指南](./docs/installation.md) - 多种安装方式
- [配置说明](./docs/configuration.md) - 配置项详细说明
- [使用指南](./docs/usage.md) - 使用方法和故障排除
- [frp 内网穿透配置](./docs/frp-setup.md) - 暴露到公网教程
- [开发文档](./docs/development.md) - 二次开发指南

## 📝 使用示例

### 分享当前目录给局域网

```bash
# .env
HOST=0.0.0.0
PORT=8090
STATIC_ROOT=./

# 启动
ark-pan
```

其他设备通过 `http://your-ip:8090` 访问。

### 配合 PM2 后台运行

```bash
pm2 start ark-pan --name ark-pan
pm2 startup
pm2 save
```

## 🤝 开发

欢迎贡献代码或提出建议：

```bash
# 安装依赖
pnpm install

# 构建
pnpm run build

# 测试
pnpm run test
```

详见 [开发文档](./docs/development.md)。

## 📄 License

MIT
