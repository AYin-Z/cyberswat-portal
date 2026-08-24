#!/usr/bin/env bash
# CyberSWAT 主站 — 一键构建部署
# 用法: ./deploy.sh [--no-build]
# 流程: 门禁(typecheck) → vite-ssg 预渲染构建 → 产物修正 → docker compose 重建容器
# 编排: 镜像/容器参数(端口/restart/healthcheck/log rotation)只存在于 docker-compose.yml
set -euo pipefail
cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:$PATH"

if [ "${1:-}" != "--no-build" ]; then
  echo "==> 1/4 类型检查"
  pnpm typecheck

  echo "==> 2/4 预渲染构建 (vite-ssg)"
  pnpm build
else
  echo "==> 1-2/4 跳过构建（--no-build）"
fi

echo "==> 3/4 产物修正 (权限/清理)"
chmod 644 dist/robots.txt dist/sitemap.xml dist/og.png 2>/dev/null || true
rm -f dist/.html
rm -rf dist/.vite

echo "==> 4/4 镜像与容器 (docker compose)"
# 清理 docker run 时代遗留容器（无 compose label，同名冲突；compose 管理后此步为 no-op）
docker rm -f cyberswat-main >/dev/null 2>&1 || true
docker compose up -d --build --remove-orphans
docker compose ps

echo "==> 验证"
sleep 2
for p in / /about /honors /members /departments /news; do
  printf '  %-14s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8091$p)"
done
echo "==> 完成: http://127.0.0.1:8091 (https://cyberswat.cn)"
