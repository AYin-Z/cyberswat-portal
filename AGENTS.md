# cyberswat-portal — CyberSWAT 网络特警队门户

## 项目身份
网络特警队（CyberSWAT）官方门户网站。域名 **cyberswat.cn**（阿里云注册，DNS 托管已转 Cloudflare，免 ICP 备案）。

## 关键决策（2026-08-06 立项确认）
- 技术栈：Vue3 + Vite + TS + Pinia + vue-router（与 ayin-portal 同栈，用户主力栈）
- 设计语言：深色科技风（0d1117 底 + 语义色），与 ayin-portal 设计 token 一致，后续可差异化
- 部署：Docker 容器化（cyberswat-main:latest，nginx:alpine，127.0.0.1:8091）→ CF Tunnel → cyberswat.cn
- 友情链接：0psu3.team（CTF 部门战队 Opsu3）
- 端口约定：dev 5174（本地）/ 容器 8091（生产）
- **Git 双仓库（2026-08-07）**：origin 双 push —— 个人仓 AYin-Z/cyberswat-portal（主源）+ 组织仓 PPSUC-CyberSWAT/cyberswat-portal（同步）。fetch 只从个人仓。`git push origin main` 自动双推。仓库级 http.proxy=127.0.0.1:7890（github 直连 TLS 被重置）

## 架构设想（2026-08-06 用户口述）
- **主站 cyberswat.cn**：资讯 + 往期风采 + 社团介绍（主页聚合）——✅ 已上线
- **部门子域名**：每个部门独立子站（如 attack.cyberswat.cn），各部门自己提 PRD，我们实现
  - 部门 slug 已定短英文：attack/forensics/modeling/algorithm/bigdata/dev/ai/pr
  - 子站路由占位已实现（/departments/:slug），子站独立容器端口 8092-8099 预留
  - 子站上线流程：docker-compose 加服务 → tunnel ingress 加 hostname → DNS CNAME（脚本已跑通）

## 架构
```
用户 → CF Edge (cyberswat.cn) → CF Tunnel (2615b5fa..., ingress v53+) → localhost:8091 → nginx 容器 → Vue3 SPA
主站路由：
  /                   首页（Hero/数据/部门/荣誉精选/友链）
  /about              社团介绍（沿革时间线）
  /honors             荣誉墙（38 条，按年/部门筛选）
  /departments        部门总览
  /departments/:slug  部门子站占位（显示子域名 + PRD 提示）
  /news               资讯占位（挂 todolist）
```

## 环境
- Node v24.11.1 / pnpm 11.17.0
- pnpm 11 配置：`onlyBuiltDependencies` 必须在 **pnpm-workspace.yaml**（package.json 的 pnpm 字段已被忽略）
- esbuild 是 vite 传递依赖，顶层无 .bin 链接属正常，vite 内部调用正常

## 部署记录（2026-08-06 完成）
1. **DNS 托管迁移**：阿里云 NS → Cloudflare（guss/tessa.ns.cloudflare.com），zone cyberswat.cn `35d1bb2d8492b98e308853c4e5ce7289` active
   - 阿里云 CLI：`aliyun domain SaveTaskForModifyingDomainDns --DomainName cyberswat.cn --AliyunDns false --DnsList.1 guss.ns.cloudflare.com --DnsList.2 tessa.ns.cloudflare.com`
   - ⚠️ .cn 域名注册商不能转 CF Registrar（CF 不支持 .cn），DNS 托管可转——已实现
2. **Tunnel ingress**：cyberswat.cn → http://localhost:8091（PUT API，保留全部 26 条旧路由 + 404 catch-all）
3. **DNS CNAME**：cyberswat.cn → 2615b5fa-3500-4921-97ba-19d602660cda.cfargotunnel.com（proxied=true）
4. **Docker 部署**：cyberswat-main 容器，--restart unless-stopped，仅绑 127.0.0.1
5. **验证**：https://cyberswat.cn HTTP 200 / SSL 证书 Google Trust Services / /honors SPA 回退 200

## 已知坑
- **Docker 容器内访问外网**（npm/apt 等）：Mihomo fake-ip 黑洞——容器 bridge 流量不进 TUN，域名解析成 fake-ip 后连接超时。已修：fake-ip-filter 加 registry.npmmirror.com / registry.npmjs.org / dl-cdn.alpinelinux.org / github.com 等（~/.config/mihomo/config.yaml）。改后 curl PUT :9090/configs 重载
- **Docker 镜像构建**：容器内 npm install 仍可能卡（Node HTTP 栈与 fake-ip 交互遗留问题），本项目 Dockerfile 采用"宿主 pnpm build → 镜像 COPY dist"，容器内不需要 npm
- **CF token**：已有权限 = Tunnel:Edit + DNS:Edit + Zone:Edit（2026-08-06 用户加了 Zone:Edit），创建 zone 需要后者

## 内容源（已归档）
- docs/team-report-2025.md — 2025 年度报告（校宣传部门）
- docs/report-2024.md — 2024 年度报告（校宣传部门）
- docs/showcase-2023-2024.md — 2023-2024 风采展示（校宣传部门，含干部/成员/历史荣誉）
- src/data/team.ts — 结构化数据：departments（8部门）/ awards（2023-2025 荣誉墙）/ friendLinks

## 待办
- [ ] LOGO 替换 ⬡ 占位符（等师兄给图）
- [ ] 部门子站 PRD 收集 → 逐个上线（容器 8092-8099 + ingress + CNAME）
- [ ] 资讯频道（公众号内容同步，挂 todolist）
- [ ] 主站内容扩充（成员风采页等，数据在 showcase 文档）
