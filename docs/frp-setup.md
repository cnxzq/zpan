# frp 内网穿透配置

Ark Pan 设计之初就考虑了配合 frp 内网穿透使用，将本地搭建的网盘暴露到公网访问。

## 什么是 frp

[frp](https://github.com/fatedier/frp) 是一个专注于内网穿透的高性能反向代理工具，可以将内网服务暴露到公网。

## 前提条件

- 一台有公网 IP 的服务器（用于运行 frp 服务端 frps）
- 内网中的机器（用于运行 Ark Pan 和 frp 客户端 frpc）

## 服务端配置（frps）

在公网服务器上创建 `frps.toml`：

```toml
bindPort = 7000
token = "your-authentication-token"
vhostHTTPPort = 80
```

启动 frps：

```bash
./frps -c frps.toml
```

使用 systemd 后台运行：

```systemd
[Unit]
Description=frp server
After=network.target

[Service]
ExecStart=/usr/local/bin/frps -c /etc/frp/frps.toml
Restart=always

[Install]
WantedBy=multi-user.target
```

## 客户端配置（frpc）

在内网机器上创建 `frpc.toml`：

```toml
serverAddr = "your-server-ip"
serverPort = 7000
auth.method = "token"
auth.token = "your-authentication-token"

[[proxies]]
name = "ark-pan"
type = "http"
localIP = "127.0.0.1"
localPort = 8090
customDomains = ["your-domain.com"]
```

说明：
- `serverAddr`: 你的公网服务器 IP 或域名
- `serverPort`: frps 绑定的端口，默认 7000
- `auth.token`: 和 frps 配置一致的 token
- `localIP`: Ark Pan 监听的地址，一般是 127.0.0.1
- `localPort`: Ark Pan 监听的端口，默认 8090
- `customDomains`: 绑定的域名，如果没有域名可以留空或使用二级域名

启动 frpc：

```bash
./frpc -c frpc.toml
```

## 完整示例

### 场景

- 公网服务器 IP: `123.123.123.123`
- 内网机器: 在 `127.0.0.1:8090` 运行 Ark Pan
- 想要通过 `http://pan.yourdomain.com` 访问

### frps 配置（公网服务器）

```toml
bindPort = 7000
token = "my-secret-token"
vhostHTTPPort = 80
```

### frpc 配置（内网机器）

```toml
serverAddr = "123.123.123.123"
serverPort = 7000
auth.method = "token"
auth.token = "my-secret-token"

[[proxies]]
name = "ark-pan"
type = "http"
localIP = "127.0.0.1"
localPort = 8090
customDomains = ["pan.yourdomain.com"]
```

### DNS 配置

将域名 `pan.yourdomain.com` 的 A 记录指向 `123.123.123.123`。

### 启动

1. 在公网服务器启动 frps
2. 在内网机器启动 frpc
3. 在内网机器启动 Ark Pan
4. 访问 `http://pan.yourdomain.com` 即可

## 使用二级域名

如果没有独立域名，可以用 subdomain 方式：

frpc 配置：

```toml
[[proxies]]
name = "ark-pan"
type = "http"
localIP = "127.0.0.1
localPort = 8090
subdomain = "pan"
```

访问地址将是：`http://pan.yourdomain.com`（如果根域名已经解析到 frps 服务器）。

## HTTPS 配置

如果你有域名并配置了 HTTPS，可以通过 Nginx 在 frps 服务器端反向代理：

```nginx
server {
    listen 443 ssl;
    server_name pan.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 直接使用 IP 访问

如果没有域名，可以修改 frpc 配置使用不同端口：

frps.toml:

```toml
bindPort = 7000
token = "your-token"
```

frpc.toml:

```toml
serverAddr = "123.123.123.123"
serverPort = 7000
auth.method = "token"
auth.token = "your-token"

[[proxies]]
name = "ark-pan"
type = "tcp"
localIP = "127.0.0.1"
localPort = 8090
remotePort = 8090
```

这样就可以直接通过 `http://123.123.123.123:8090` 访问。

## 开机自启

### Systemd (Linux)

创建 `/etc/systemd/system/ark-pan.service`:

```ini
[Unit]
Description=Ark Pan File Sharing
After=network.target

[Service]
User=your-user
WorkingDirectory=/path/to/ark-pan
ExecStart=/usr/local/bin/ark-pan
Restart=always

[Install]
WantedBy=multi-user.target
```

启用：

```bash
sudo systemctl daemon-reload
sudo systemctl enable ark-pan
sudo systemctl start ark-pan
```

同样方式配置 frpc。

## 更多资源

- frp 官方文档: https://github.com/fatedier/frp
- frp 下载地址: https://github.com/fatedier/frp/releases
