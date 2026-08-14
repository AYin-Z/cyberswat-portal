# 开发部子站系统 — 技术选型（定稿）

> 日期：2026-08-12 · 状态：✅ 已拍板
> 场景：开发部子站（dev.cyberswat.cn）前后端完备系统，承载公告发布 / 信息流转 / 轻量社区 / 点子墙
> 原则：不迁就既有项目经验，从需求特征选择最合适的技术栈

## 0. 需求特征（选型的输入）

| 特征 | 说明 | 影响 |
|---|---|---|
| CRUD 密集型 | 公告/帖子/评论/任务/点子/成员资料，全量增删改查 | 框架生态成熟度 > 极致性能 |
| 权限分层 | 访客/成员/部长/管理员，部门级隔离，邀请制激活 | 需要成熟的守卫/中间件/装饰器体系 |
| 字段级脱敏 | 公安院校隐私：姓名/区队/联系方式对外不可见 | API 层统一序列化控制 |
| 实时通知 | @通知、公告已读提醒、任务流转提醒 | WebSocket/SSE 支持 |
| GitHub OAuth 二级认证 | 邮箱主 + GitHub 绑定同步 | OAuth 客户端库 |
| 单机小规模 | 成员数十人，容器 8092 单端口 | 不需要微服务 |
| 社团长期维护 | 成员换届，学弟学妹要能接手 | 技术栈需主流、文档化、易上手 |

## 1. 方案对比

### 方案 A：NestJS + Prisma + PostgreSQL + socket.io（✅ 选定）

```text
API:   NestJS 11 (TypeScript, Express 内核) + JWT + GitHub OAuth
ORM:   Prisma (schema 即模型，迁移内置，TS 类型自动生成)
DB:    PostgreSQL 16 (JSONB / 数组 / 全文检索原生支持)
实时:  socket.io (@通知 / 公告已读 / 任务流转推送)
前端:  Vue3 + Vite + TS + Pinia (与主站同栈)
```

**选它的理由（按权重排序）：**

1. **全栈单一语言 TypeScript**：实体/DTO 类型从数据库 → API → 前端全链路共享。本项目是强结构数据（成员 links、点子卡片、项目模板、任务状态机），类型共享直接消灭一大类前后端联调 bug。Vue3 + TS + Node 也是当前高校技术社团最主流、新人最容易接手的组合（长期维护关键）。
2. **权限体系一等公民**：NestJS 的 Guard / Interceptor / Decorator 原生支持声明式权限（`@Roles('admin')`）+ 全局序列化拦截器做字段级脱敏。本项目权限分层是核心复杂度，不是附加功能。
3. **模块化架构**：公告 / 社区 / 任务 / 点子墙 / 成员各一个 Module，边界清晰；骨架可整体复制给其余 7 个部门子站（子站体系是既定路线）。
4. **实时通知生态成熟**：socket.io 与 NestJS 官方集成（`@nestjs/websockets`），@通知/已读推送开箱即用。
5. **ORM 类型安全**：Prisma 的 schema 即数据模型文档 + 自动迁移 + 生成类型，比 TypeORM 装饰器实体更干净，比 Drizzle 生态更成熟。
6. **部署简单**：Node 单容器 + PostgreSQL 单容器，nginx 反代，CF Tunnel 沿用主站模式。

### 方案 B：Go (Gin/Fiber) + GORM + PostgreSQL

- 性能天花板、单二进制部署；但 CRUD 开发效率显著低于 TS（手写结构体/校验/序列化），类型无法与前端共享，社团新人上手门槛高（学生普遍更熟 JS 系）。本系统是 IO 密集型小规模业务，Go 的性能优势发挥不出来。❌

### 方案 C：Python (FastAPI) + SQLAlchemy + PostgreSQL

- 开发快、自动 OpenAPI、后续接 AI 生态方便；但同样无法与前端共享类型，ORM 类型安全弱于 Prisma，WebSocket 生态和权限体系不如 NestJS 成熟。若未来子站要深度集成 AI 可局部引入 Python 微服务，但不作为主栈。❌

### 方案 D：Node + Fastify + TS（轻量替代）

- 直白快速，但权限/脱敏/模块化全靠手写，规模增长后维护成本高于 NestJS 的声明式体系；本项目权限是核心需求，不值得省这个抽象成本。列为备选。◽

## 2. 数据库：PostgreSQL 16

- **JSONB**：成员 `links: [{label,url}]`、点子/项目扩展字段、标签数组，原生索引与查询
- **数组类型**：技术栈标签、成员方向多选
- **全文检索**：社区帖子搜索（`tsvector`，中文配合 zhparser 或简单分词可满足 MVP）
- **枚举**：任务状态机（待接单/进行中/待验收/已完成）、点子状态（草稿/招募中/孵化中/已转正/已废弃）
- 对比 MySQL：JSON 查询弱、无数组、中文全文检索差 → PG 全面胜出

## 3. 认证与安全（延续 PRD 拍板）

- 主认证：邮箱 + 密码（argon2id 或 bcrypt）+ JWT（access 15min + refresh 14d，refresh 轮换）
- 二级：GitHub OAuth（绑定后同步成员主页 GitHub 信息，头像/昵称/主页）
- 激活：邀请制（部长开号）+ 注册后审核，邮箱验证链接
- 脱敏：序列化拦截器统一控制——公网 API 仅出昵称/方向/签名/links，姓名/区队/学号仅内部
- 安全基线：helmet + rate-limit + CORS 白名单 + 输入校验（class-validator DTO）

## 4. 部署架构

```
用户 → CF Edge (dev.cyberswat.cn) → CF Tunnel → localhost:8092 → nginx 容器
                                                                     ├→ dev-web (Vue3 SPA, 静态)
                                                                     └→ dev-api (NestJS, 127.0.0.1:8093, 不直接暴露公网)
PostgreSQL 容器 (cyberswat-dev-db, 仅内网 127.0.0.1 绑定或 docker 内网)
```

- 容器：`cyberswat-dev-web`（8092）、`cyberswat-dev-api`（8093 内网）、`cyberswat-dev-db`（5432 内网）
- 沿用主站模式：宿主 pnpm build → 镜像 COPY dist（规避容器内 npm 与 fake-ip 的已知坑）
- API 由 nginx 在同一容器或独立容器反代，公网只暴露 8092 一个口

## 5. 仓库组织

- **独立仓库 `cyberswat-dev-portal`**（个人 AYin-Z + 组织 PPSUC-CyberSWAT 双仓推送，沿用主站双仓策略）
- pnpm workspace monorepo：
  ```
  cyberswat-dev-portal/
    apps/web/          # Vue3 子站前端 (dev.cyberswat.cn 页面)
    apps/api/          # NestJS 后端
    packages/shared/   # 共享类型/DTO（web 与 api 共同依赖）
    docs/              # 子站 PRD / 开发文档
  ```
- 理由：主站是纯静态仓库，不应混入后端复杂度；子站体系每部门一仓（或按需聚合），符合"各部门独立 PRD 独立部署"既定架构

## 6. 里程碑建议

- M0: 仓库 + monorepo 骨架 + CI 构建跑通
- M1: 认证（邮箱注册/登录/JWT/GitHub OAuth）+ 权限分层（访客/成员/部长/管理员）
- M2: 公告（发布/已读追踪）+ 成员主页（Vidar 卡片 + links + 项目经历）
- M3: 点子墙（发布/招募/转正）+ 任务分派（指派/接单/提交/验收）
- M4: 轻量社区（帖子/评论/点赞/@通知，socket.io）
- M5: 上线 dev.cyberswat.cn（容器 + ingress + CNAME）
