# 配置说明

Ark Pan 支持三种配置方式：**.env 文件**、**环境变量** 和 **命令行参数**，优先级从高到低：命令行参数 > 环境变量 > .env > 默认值。

## 配置方式

### 方式一：使用 .env 文件（推荐）

复制示例配置文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务配置
PORT=8090
HOST=127.0.0.1

# 静态文件根目录
STATIC_ROOT=/path/to/your/static/files

# 认证信息
USERNAME=admin
PASSWORD=your-password-here

# 认证域名称（浏览器弹出框显示）
REALM=Ark Pan - Protected Area

# 最大上传文件大小（字节）
MAX_FILE_SIZE=10737418240
```

### 方式二：使用环境变量

```bash
# Linux/macOS
export PORT=8080
export STATIC_ROOT=/data/files
export USERNAME=user
export PASSWORD=mypassword
ark-pan

# 或者直接一行
PORT=8080 STATIC_ROOT=/data/files USERNAME=user PASSWORD=mypassword ark-pan
```

```batch
:: Windows CMD
set PORT=8080
set STATIC_ROOT=C:\files
ark-pan
```

```powershell
# Windows PowerShell
$env:PORT = "8080"
$env:STATIC_ROOT = "C:\files"
ark-pan
```

### 方式三：使用命令行参数

```bash
# 格式：ark-pan [port] [static-root]
ark-pan 8080 /path/to/files
```

- 第一个参数：端口号
- 第二个参数：静态文件根目录

其它配置（用户名、密码等）仍然需要通过环境变量或 .env 设置。

## 配置项说明

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `8090` | 服务监听端口 |
| `HOST` | `127.0.0.1` | 绑定地址，`0.0.0.0` 允许所有地址访问 |
| `STATIC_ROOT` | 当前工作目录 | 要托管的静态文件根目录 |
| `USERNAME` | `admin` | 认证用户名 |
| `PASSWORD` | `admin123` | 认证密码 |
| `REALM` | `Ark Pan - Protected Area` | 认证域，浏览器弹出认证对话框时显示 |
| `MAX_FILE_SIZE` | `10737418240` (10GB) | 最大上传文件大小，单位字节 |

## 配置示例

### 开发环境配置

```env
PORT=8090
HOST=127.0.0.1
STATIC_ROOT=./files
USERNAME=admin
PASSWORD=admin123
```

### 生产环境配置（允许外部访问）

```env
PORT=80
HOST=0.0.0.0
STATIC_ROOT=/home/user/files
USERNAME=myusername
PASSWORD=my-secure-password
```

### 大文件支持

如果需要上传更大的文件，可以修改 `MAX_FILE_SIZE`：

```env
# 50GB
MAX_FILE_SIZE=53687091200
```

## 配置优先级

当多种配置方式同时存在时，优先级如下：

1. **命令行参数**（port 和 static-root）- 最高
2. **环境变量**
3. `.env` 文件中的配置
4. **默认值** - 最低

例如：
- 如果你在命令行指定了端口，同时 .env 也配置了端口，以命令行为准
- 如果你设置了环境变量用户名，同时 .env 也有，以环境变量为准

## 后台运行（生产环境）

使用 PM2 保持后台运行：

```bash
# 安装 PM2
npm install -g pm2

# 启动
pm2 start ark-pan --name ark-pan

# 查看日志
pm2 logs ark-pan

# 开机自启
pm2 startup
pm2 save
```
