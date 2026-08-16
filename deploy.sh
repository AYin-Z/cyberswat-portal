#!/usr/bin/env bash
# CyberSWAT 主站 — 一键构建部署
# 用法: ./deploy.sh [--no-build]
# 流程: 类型检查 → vite-ssg 预渲染构建 → 权限修正 → Docker 镜像 → 容器重启
set -euo pipefail
cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:$PATH"

echo "==> 1/4 类型检查"
./node_modules/.bin/vue-tsc -b --noEmit

echo "==> 2/4 预渲染构建 (vite-ssg)"
./node_modules/.bin/vite-ssg build

echo "==> 3/4 产物修正 (权限/清理)"
chmod 644 dist/robots.txt dist/sitemap.xml dist/og.png 2>/dev/null || true
rm -f dist/.html
rm -rf dist/.vite

echo "==> 4/4 镜像与容器"
docker build -t cyberswat-main:latest .
docker rm -f cyberswat-main >/dev/null 2>&1 || true
docker run -d --name cyberswat-main --restart unless-stopped -p 127.0.0.1:8091:80 cyberswat-main:latest

echo "==> 验证"
sleep 2
for p in / /about /honors /members /departments /news; do
  printf '  %-14s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8091$p)"
done
echo "==> 完成: http://127.0.0.1:8091 (https://cyberswat.cn)"
