# CyberSWAT Portal

中国人民公安大学网络特警队（CyberSWAT）门户网站。

- 域名：cyberswat.cn
- 技术栈：Vue3 + Vite + TypeScript + Pinia + Vue Router
- 包管理：pnpm

## 开发

```bash
pnpm install
pnpm dev        # http://localhost:5174
pnpm build      # 产物在 dist/
pnpm preview
```

## 结构

```
src/
  assets/       # 全局样式与设计 token
  router/       # 路由
  views/        # 页面
  App.vue
  main.ts
```

详情见 AGENTS.md。
