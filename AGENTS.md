# cyberswat-portal — 中国人民公安大学网络特警队门户

## 项目身份
中国人民公安大学网络特警队（CyberSWAT）官方门户网站。域名 **cyberswat.cn**（阿里云购买，ICP 备案待办）。

## 关键决策（2026-08-06 立项确认）
- 技术栈：Vue3 + Vite + TS + Pinia + vue-router（与 ayin-portal 同栈，用户主力栈）
- 设计语言：深色科技风（0d1117 底 + 语义色），与 ayin-portal 设计 token 一致，后续可差异化
- 部署目标：阿里云 ECS（cn-beijing, i-2ze3i8prdd5saa8q1ru4，EMQX 同机）——待确认是否用同一台
- 友情链接：0psu3.team（CTF 部门战队 Opsu3）
- 端口约定：dev 5174（本地）

## 架构设想（2026-08-06 用户口述，待细化）
- **主站 cyberswat.cn**：资讯 + 往期风采 + 社团介绍（主页聚合）
- **部门子域名**：每个部门独立子站（如 attack.cyberswat.cn），各部门自己提 PRD，我们实现
  - 部门 slug 参考 src/data/team.ts 的 departments（attack-defense/forensics/modeling/algorithm/big-data/development/ai/publicity）
  - 子域名命名待定：建议短 slug（attack/forensics/modeling/algorithm/bigdata/dev/ai/pr）
  - 部署形态待定：nginx 多子站 or 单站多路由（取决于各部门 PRD 的差异度）

## 架构
```
cyberswat.cn (Vue3 SPA)
  /            首页（队伍介绍/Hero）
  ...          页面规划中（待 PRD）
      ↓ fetch（如需后端）
  <后端待定>（静态站优先，无后端则不引入）
```

## 环境
- Node v24.11.1 / pnpm 11.17.0
- pnpm 11 配置：`onlyBuiltDependencies` 必须在 **pnpm-workspace.yaml**（package.json 的 pnpm 字段已被忽略）
- esbuild 是 vite 传递依赖，顶层无 .bin 链接属正常，vite 内部调用正常

## 已验证
- `pnpm build`（vue-tsc + vite build）✅ 39 modules, 374ms
- `vite dev :5174` ✅ HTTP 200

## 内容源（已归档）
- docs/team-report-2025.md — 2025 年度报告（公大团宣）
- docs/report-2024.md — 2024 年度报告（公大团宣）
- docs/showcase-2023-2024.md — 2023-2024 风采展示（公大团宣，含干部/成员/历史荣誉）
- src/data/team.ts — 结构化数据：departments（8部门）/ awards（2023-2025 荣誉墙）/ friendLinks

## 待办
- [ ] 页面信息架构 / PRD（首页、队伍介绍、部门、荣誉、招新等）
- [ ] 设计方向调研应用（design-trends / design-system-polisher / huashu-design 已装）
- [ ] DNS 解析 cyberswat.cn → 部署目标
- [ ] ICP 备案（阿里云域名，公安院校对外站点必须）
- [ ] 部署（ECS nginx / CF Tunnel 二选一）
