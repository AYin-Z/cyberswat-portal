# CyberSWAT Portal

网络特警队（CyberSWAT）官方门户网站 —— **https://cyberswat.cn**

| | |
| --- | --- |
| 技术栈 | Vue3 + Vite + TypeScript + Pinia + Vue Router（vite-ssg 预渲染） |
| 包管理 | pnpm 11（packageManager 已锁定） |
| 部署 | Docker（nginx:alpine）→ CF Tunnel → cyberswat.cn |

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:5174
pnpm check      # lint + typecheck + test + build（提交前必须全绿）
```

## 文档入口

- [`AGENTS.md`](./AGENTS.md) — 项目身份 / 关键决策 / 已知坑 / 待办（**改代码前必读**）
- [`docs/INFRA.md`](./docs/INFRA.md) — 端口 / 域名 / 容器注册表（单一事实源）
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — 提交规范 / 门禁 / 协作约定
- [`docs/`](./docs) — 决策与评审文档（PRD / VISION / 技术选型 / UI 评审 / 年度报告归档）

## 结构

```
src/
  assets/       # 全局样式与设计 token
  components/   # 布局组件（AppHeader / AppFooter）
  layouts/      # MainLayout
  router/       # 路由（与 vite-ssg 预渲染共用一份配置）
  views/        # 页面（一页一文件）
  data/         # 内容单一事实源：team(部门/荣誉) / members / news / sites(子站注册表)
  composables/  # 复用逻辑（usePageTitle）
  directives/   # v-reveal 滚动渐显
docs/           # 决策、评审、归档报告
```

详情见 AGENTS.md。
