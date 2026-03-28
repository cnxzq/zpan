# ZPan

带认证的静态文件网盘，支持文件上传。

目标：轻量、易用、中文友好

## 特性

- 🔐 **带认证** - Session 认证保护，只有登录用户才能访问
- 👥 **多用户支持** - 支持多个独立用户，每个用户有独立的根目录和权限
- 🔑 **权限控制** - 支持管理员/普通用户角色，支持只读/读写权限分离
- 📤 **支持上传** - 可以直接在网页上传文件到服务器
- 🖼️ **图片缩略图** - 自动生成图片缩略图，网格浏览更流畅
- 📱 **响应式设计** - 支持手机和桌面
- 📊 **两种布局** - 网格视图（预览图片）和列表视图
- ⚡ **轻量快速** - 基于 Express，非常轻量
- 🎯 **开箱即用** - 一条命令即可启动
- 🌐 **子路径部署** - 支持部署到非根路径 (如 `https://yourdomain.com/pan`)
- 🔍 **调试友好** - `--debug` 参数开启详细调试日志

## 安装

```bash
npm install -g zpan
# 或者
npx zpan start
```

## 快速开始

```bash
# 生成配置文件
zpan init

# 编辑配置文件
vim zpan.config.json

# 启动服务
zpan start
```

## 命令行用法

```bash
# 生成默认配置文件
zpan init [config-path]

# 启动服务
zpan start [options]

# 选项
-c, --config <path>               指定配置文件路径 (默认: zpan.config.json)
--name <name>                     覆盖实例名称
--port <port>                     覆盖监听端口
--host <host>                     覆盖绑定地址
--base-url, --baseUrl <url>       覆盖子路径部署基础 URL (例如 /pan)
--root, --static-root <dir>       覆盖服务根目录
--username, --user <user>         覆盖用户名
--password, --pass <pass>         覆盖密码
--realm <realm>                   覆盖认证域
--max-size, --max-file-size <size>  覆盖最大上传大小，支持 10MB、1GB 格式
--session-secret <secret>         覆盖 Session 密钥
--session-name <name>             覆盖 Cookie 名称

--debug                           启用调试日志（输出所有 zpan:* 日志）
-v, --version                     显示版本
-h, --help                        显示帮助
```

## 使用示例

```bash
# 生成默认配置
zpan init

# 生成到自定义文件名
zpan init my-config.json

# 使用默认配置直接启动 (端口 8090，当前目录)
zpan start

# 指定端口和目录
zpan start 8080 ~/files

# 使用自定义配置文件
zpan start --config ./my-config.json

# 覆盖部分配置参数
zpan start --port 9000 --host 0.0.0.0 --username admin --password mypass

# 限制最大上传为 2GB
zpan start --max-size 2GB

# 启用调试日志查看详细请求和路由信息
zpan --debug start

# 部署在子路径 /pan，监听 8080
zpan start --port 8080 --base-url /pan

# 开发模式（从源码运行）
npm run dev
```

## 配置文件

配置文件是 JSON 格式，以下是完整配置示例：

**单用户模式（向后兼容）：**
```json
{
  "name": "zpan",
  "port": 8090,
  "host": "127.0.0.1",
  "baseUrl": "",
  "staticRoot": "./",
  "username": "admin",
  "password": "admin123",
  "realm": "ZPan - Protected Area",
  "maxFileSize": 10737418240,
  "sessionSecret": "",
  "sessionName": "zpan"
}
```

**多用户模式：**
```json
{
  "name": "我的网盘",
  "port": 8090,
  "host": "127.0.0.1",
  "baseUrl": "",
  "staticRoot": "./files",
  "realm": "ZPan - Protected Area",
  "maxFileSize": 10737418240,
  "sessionSecret": "your-secret-key",
  "sessionName": "zpan",
  "users": [
    {
      "username": "admin",
      "password": "adminpass",
      "role": "admin",
      "permission": "write",
      "rootDir": "."
    },
    {
      "username": "alice",
      "password": "alicepass",
      "role": "user",
      "permission": "write",
      "rootDir": "users/alice"
    },
    {
      "username": "bob",
      "password": "bobpass",
      "role": "user",
      "permission": "read",
      "rootDir": "shared/bob"
    }
  ]
}
```

**配置说明：**

| 字段 | 说明 |
|------|------|
| name | 实例名称，显示在页面标题 |
| port | 监听端口 |
| host | 绑定地址，`0.0.0.0` 允许外部访问 |
| baseUrl | 子路径部署基础 URL，例如 `/pan`，部署到 `https://domain/pan` |
| staticRoot | 整体文件存储根目录（所有用户根目录都必须在此目录内） |
| username | 单用户模式：登录用户名 |
| password | 单用户模式：登录密码 |
| users | 多用户模式：用户列表，见下方说明 |
| realm | 认证域，显示在登录弹窗 |
| maxFileSize | 最大上传文件大小 (字节) |
| sessionSecret | Session 加密密钥，留空会自动生成 |
| sessionName | Session Cookie 名称 |

**多用户配置说明 (`users` 数组)：**

| 字段 | 说明 |
|------|------|
| username | 用户名（必须唯一） |
| password | 登录密码 |
| role | 角色：`admin` 或 `user`，只有 admin 能管理用户 |
| permission | 权限：`read` 只读，`write` 可读写 |
| rootDir | 用户根目录，**相对于** `staticRoot`，用户只能访问此目录内的文件 |

**安全限制：** 用户的 `rootDir` 必须在整体 `staticRoot` 目录之内，系统会强制校验防止越权访问。

**优先级：** 默认配置 < 配置文件 < 命令行参数。所有配置项都可以通过命令行覆盖。

**向后兼容：** 原有的单用户配置格式仍然完全支持，会自动转换为单用户的多用户格式。

## 多用户使用

多用户功能开启后：

1. **管理员可以在网页管理用户** - 登录后点击导航栏「用户管理」即可增删改查用户
2. **每个用户有独立根目录** - 用户登录后只能看到和操作自己根目录内的文件
3. **自动创建目录** - 管理员新增用户时，如果用户根目录不存在，系统会自动创建
4. **支持共享目录** - 多个用户可以设置相同的上级根目录，实现共享文件访问，例如：
   - `alice` → `rootDir: "shared/alice"`
   - `bob` → `rootDir: "shared/bob"`
   - 两人都只能访问自己目录，但都在同一个 shared 父目录下

**示例目录结构：**
```
./files/                # staticRoot - 整体存储根目录
├── shared/             # 共享目录
│   ├── alice/         # alice 的根目录
│   └── bob/           # bob 的根目录
└── admin/             # admin 的根目录
```

## 用户管理截图

*用户管理页面：*
![User Management](docs/assets/user-management.png)

## 截图

*grid view:*
![Grid View](docs/assets/grid.png)

*list view:*
![List View](docs/assets/list.png)

*login:*
![Login](docs/assets/login.png)

*upload:*
![Upload](docs/assets/upload.png)

## 开发

```bash
# 克隆项目
git clone https://github.com/cnxzq/zpan.git
cd zpan

# 安装依赖
pnpm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```

## 许可证

MIT
