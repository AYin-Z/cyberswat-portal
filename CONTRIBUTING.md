# CONTRIBUTING — 参与主站开发

> 适用于本仓（cyberswat-portal）的多人/多 Agent 协作；通用规范见
> `project-standards/`（PROJECT_STANDARDS / CODE_RULES / MULTI_AGENT）。

## 改动前必读

1. `AGENTS.md` — 项目身份、关键决策、已知坑（**必须读**，尤其 vite-ssg 预渲染坑）
2. `docs/INFRA.md` — 端口/域名/容器注册表（改基础设施前必读）
3. 验证命令：提交前必须 **`pnpm check` 全绿**（lint + typecheck + test + build）

## 提交规范

- `type(scope): subject`（Conventional Commits），type ∈ feat/fix/docs/style/refactor/test/chore
- scope 用真实模块名，如 `feat(home)`、`fix(sites)`、`docs(infra)`
- 修改内容数据（src/data/*）时先跑 `pnpm test`（数据一致性单测是门禁）

## 分支与流程

- `main` = 生产（直接可发布）；功能/修复走 `feature/*`、`fix/*`，PR 合并（PS2/PS5）
- 多 Agent 并行：独立分支；修改同一文件前基于最新 main（MA1/MA3）；合并前冲突检测（MA4）
- 双仓双推：`git push origin main` 自动推个人仓 + 组织仓（fetch 只从个人仓）

## 门禁

- lint：`@typescript-eslint/no-explicit-any` 为 error（CODE_RULES 禁 any 的机器强制）
- 测试：数据层单测必须与数据一起更新；新增内容源（data/*.ts）同步补 `*.test.ts`
- 格式化：Prettier（.prettierrc.json）；docs/ public/ lockfile 已忽略
