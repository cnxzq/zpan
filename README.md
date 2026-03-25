# Ark Pan

带基础认证的静态文件网盘，通过 frp 内网穿透访问。

## Features

- ✅ 静态文件托管
- ✅ 目录浏览支持
- ✅ Basic Auth 账号密码保护
- ✅ 使用环境变量配置 (.env)
- ✅ 通过 frp 内网穿透暴露到公网

## Installation

```bash
npm install
```

## Configuration

复制 `.env.example` 为 `.env`，修改配置：

```bash
cp .env.example .env
vi .env
```

配置项：

```env
# Server configuration
PORT=8090
HOST=127.0.0.1

# Static files directory
STATIC_ROOT=/path/to/your/static/files

# Authentication
USERNAME=admin
PASSWORD=your-password-here

# Realm name
REALM=Ark Pan - Protected Area
```

## Start

```bash
npm start
```

## Frp 配置示例

客户端 `frpc.toml`:

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
customDomains = ["your-domain-or-ip"]
```

## License

MIT
