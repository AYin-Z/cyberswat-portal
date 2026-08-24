# INFRA — 基础设施注册表（单一事实源）

> 凡"端口/域名/容器/上线状态"类事实，**只在此处登记**，其他文档（AGENTS.md/README/compose 注释）
> 一律引用本表，不得另写一份。新增/变更子站必须同步更新本表 + 主站 `src/data/sites.ts`。

## 对外域名与入口

| 域名 | 入口 | 上游 | 状态 |
| --- | --- | --- | --- |
| https://cyberswat.cn | CF Tunnel `2615b5fa`（远端托管 ingress） | `http://localhost:8091` | ✅ 上线 2026-08-06 |
| https://dev.cyberswat.cn | CF Tunnel `2615b5fa`（远端托管 ingress） | `http://localhost:8092` | ✅ 上线 2026-08-15 |

- tunnel 为 **remote-managed**：实际 ingress 以 CF 远端配置为准（本地 `~/.cloudflared/config.yml`
  为历史遗留，**不生效**，仅作参考——改动/重启前务必确认）。
- DNS：两域名均 CNAME → `2615b5fa-3500-4921-97ba-19d602660cda.cfargotunnel.com`（proxied=true）。

## 容器与端口分配表

| 端口 | 服务 | 容器/镜像 | 网络 | 仓库 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 8091 | 主站 web | `cyberswat-main` (nginx:alpine) | host | cyberswat-portal | 仅绑 127.0.0.1 |
| 8092 | 开发部子站 web | `cyberswat-dev-web` (nginx) | host 127.0.0.1 + cyberdev | cyberswat-dev-portal | nginx 反代 dev-api:8093 |
| 8093 | 开发部子站 api | `cyberswat-dev-api` (node:24-slim) | cyberdev | cyberswat-dev-portal | 仅内网；MCP 占 8094 |
| 8094 | 开发部 MCP | 同上容器内 | cyberdev | cyberswat-dev-portal | 仅内网 |
| 5432 | 开发部 PG | `cyberswat-dev-db-prod` (postgres:16-alpine) | cyberdev | — | 命名卷 `cyberdev-pgdata`，无宿主映射 |
| 5433 | 本地开发 PG | `cyberswat-dev-db` | host | — | 开发用（apps/api/.env） |
| **8095-8099** | 预留 | 未来部门子站 | — | — | 新子站按序分配 |

本地开发端口：主站 Vite **5174** ／ 开发部 web **5175**（proxy /api + /socket.io → 127.0.0.1:8093）／ api **8093**。

## 密钥与配置

| 项 | 位置 | 备注 |
| --- | --- | --- |
| 生产 DB 密码 | `~/.cyberswat-dev-prod.env`（chmod 600） | 已轮换强随机；容器 env 注入 |
| 生产 JWT_SECRET | 运行容器 env（无持久文件） | ⚠️ 待补持久化 + 轮换 SOP |
| GitHub OAuth secret | GitHub App 配置 + 容器 env | 2026-08-15 验证通过 |
| compose 变量 | `docker-compose.yml` `${VAR:?}` 强校验 | 禁止硬编码明文凭据 |

## 数据与运维

- 备份：每日 03:00 cron `pg_dump` → `~/backups/cyberswat`（30 天滚动，结果写 backup.log）
- ⚠️ 恢复演练未做过；备份仅本机 `/home`（单点）——见待办
- 迁移：api 容器启动自动 `prisma migrate deploy`（幂等）

## 上线流程（每子站固定动作）

1. 本表登记端口/域名（修改上表 + AGENTS.md 部署记录）
2. 主站 `src/data/sites.ts` 注册（liveSubsites 追加一条）
3. 子站仓库 Dockerfile/compose 就绪 → 宿主构建镜像
4. CF Tunnel ingress：CF API PUT 插入 `子站.cyberswat.cn → localhost:<端口>`
5. DNS CNAME → cfargotunnel.com（proxied=true）
6. 验证：域名 200 + 核心接口健康 + 主站占位页展示已上线
