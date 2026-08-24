# CyberSWAT 主站 — nginx 静态托管
# 策略：宿主/CI 执行 pnpm build（vite-ssg 预渲染）产出 dist/，镜像只打包静态产物
# 理由：容器内 npm 网络受 Mihomo fake-ip 干扰不可靠；纯静态站产物即交付物
# 构建：pnpm build && docker build -t cyberswat-main:latest .
FROM nginx:1.27-alpine
COPY dist /usr/share/nginx/html
# SPA history 路由回退 + 预渲染页优先（vite-ssg 产物：/about → about.html）
# 安全基线：server_tokens off + 安全响应头；/assets 为 vite 哈希产物 → 长缓存 immutable
RUN printf 'server {\n\
  listen 80;\n\
  server_tokens off;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  add_header X-Content-Type-Options nosniff always;\n\
  add_header X-Frame-Options DENY always;\n\
  add_header Referrer-Policy strict-origin-when-cross-origin always;\n\
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;\n\
  location /assets/ {\n\
    add_header X-Content-Type-Options nosniff always;\n\
    add_header X-Frame-Options DENY always;\n\
    add_header Referrer-Policy strict-origin-when-cross-origin always;\n\
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;\n\
    add_header Cache-Control "public, max-age=31536000, immutable" always;\n\
    try_files $uri =404;\n\
  }\n\
  location / {\n\
    try_files $uri $uri.html $uri/ /index.html;\n\
  }\n\
  gzip on;\n\
  gzip_types text/css application/javascript application/json image/svg+xml;\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
# 健康检查：nginx:alpine 自带 busybox wget（compose 亦配置了健康检查兜底）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
