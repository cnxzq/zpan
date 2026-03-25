#!/bin/bash
# ark-pan release build script
# Generates clean release package for production deployment

set -e

PROJECT_NAME="ark-pan"
RELEASE_DIR="release/${PROJECT_NAME}"

echo "🚀 Building ark-pan release..."

# 创建发布目录
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# 复制必要文件
cp ../static-server/auth-server.js "$RELEASE_DIR/"
cp ../static-server/package.json "$RELEASE_DIR/"
cp ../static-server/.env.example "$RELEASE_DIR/"
cp ../static-server/.gitignore "$RELEASE_DIR/"
cp ../static-server/README.md "$RELEASE_DIR/"

echo "✅ Release created at $RELEASE_DIR"
echo "📦 File list:"
ls -la "$RELEASE_DIR/"

echo ""
echo "To deploy:"
echo "  1. Upload $RELEASE_DIR to your server"
echo "  2. cp .env.example .env, edit configuration"
echo "  3. pnpm install"
echo "  4. Start service"
