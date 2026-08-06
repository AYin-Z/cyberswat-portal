# CyberSWAT 主站 — nginx 静态托管
# 策略：宿主/CI 执行 pnpm build 产出 dist/，镜像只打包静态产物
# 理由：容器内 npm 网络受 Mihomo fake-ip 干扰不可靠；纯静态站产物即交付物
# 构建：pnpm build && docker build -t cyberswat-main:latest .
FROM nginx:1.27-alpine
COPY dist /usr/share/nginx/html
# SPA history 路由回退
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  gzip on;\n\
  gzip_types text/css application/javascript application/json image/svg+xml;\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
