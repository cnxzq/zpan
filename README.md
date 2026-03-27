# ZPan

带认证的静态文件网盘，支持文件上传。

## 特性

- 🔐 **带认证** - 基础认证保护，只有登录用户才能访问
- 📤 **支持上传** - 可以直接在网页上传文件到服务器
- 📱 **响应式设计** - 支持手机和桌面
- 📊 **两种布局** - 网格视图（预览图片）和列表视图
- ⚡ **轻量快速** - 基于 Express，非常轻量
- 🎯 **开箱即用** - 一条命令即可启动

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
--root, --static-root <dir>       覆盖服务根目录
--username, --user <user>         覆盖用户名
--password, --pass <pass>         覆盖密码
--realm <realm>                   覆盖认证域
--max-size, --max-file-size <size>  覆盖最大上传大小，支持 10MB、1GB 格式
--session-secret <secret>         覆盖 Session 密钥
--session-name <name>             覆盖 Cookie 名称

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

# 开发模式（从源码运行）
npm run dev
```

## 配置文件

配置文件是 JSON 格式，默认如下：

```json
{
  "name": "zpan",
  "port": 8090,
  "host": "127.0.0.1",
  "staticRoot": "./",
  "username": "admin",
  "password": "admin123",
  "realm": "ZPan - Protected Area",
  "maxFileSize": 10737418240,
  "sessionSecret": "",
  "sessionName": "zpan"
}
```

**配置说明：**

| 字段 | 说明 |
|------|------|
| name | 实例名称，显示在页面标题 |
| port | 监听端口 |
| host | 绑定地址，`0.0.0.0` 允许外部访问 |
| staticRoot | 要分享的文件根目录 |
| username | 登录用户名 |
| password | 登录密码 |
| realm | HTTP 基础认证的 realm |
| maxFileSize | 最大上传文件大小 (字节) |
| sessionSecret | Session 加密密钥，留空会自动生成 |
| sessionName | Session Cookie 名称 |

**优先级：** 默认配置 < 配置文件 < 命令行参数。所有配置项都可以通过命令行覆盖。

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
git clone https://github.com/zhuqiang626/ark-pan.git
cd ark-pan

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
