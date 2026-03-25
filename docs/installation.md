# 安装指南

## 系统要求

- **Node.js**: 版本 16.0 或更高
- **npm** 或 **pnpm**: 推荐使用 pnpm
- **操作系统**: Windows、macOS、Linux 都支持

## 安装方式

### 方式一：从源码安装（开发）

```bash
# 克隆项目
git clone <repository-url>
cd ark-pan

# 安装依赖
pnpm install

# 构建
pnpm run build
```

### 方式二：通过 npm 全局安装

```bash
# 全局安装
npm install -g ark-pan

# 验证安装
ark-pan --version
```

### 方式三：本地打包安装

```bash
# 克隆项目并构建
git clone <repository-url>
cd ark-pan
pnpm install
pnpm run build

# 打包为 tgz
npm pack

# 全局安装
npm install -g ark-pan-1.0.0.tgz
```

## 从源码运行

如果你修改了代码，可以重新构建后运行：

```bash
# 重新构建
pnpm run build

# 启动
pnpm start
```

## 验证安装

安装完成后，可以运行帮助命令验证：

```bash
ark-pan --help
```

应该输出类似如下内容：

```
Ark Pan - 带认证的静态文件网盘

Usage:
  ark-pan [options] [port] [static-root]

Options:
  -h, --help      Show help
  -v, --version   Show version

Examples:
  ark-pan                          Start with default config (port 8090, current directory)
  ark-pan 8080 /path/to/files      Custom port and root directory
  ark-pan --help                   Show help
```

## 下一步

安装完成后，请继续阅读：
- [配置说明](./configuration.md) - 了解如何配置 Ark Pan
- [使用指南](./usage.md) - 了解如何使用 Ark Pan
