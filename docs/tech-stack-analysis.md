# 开发部子站系统 — 后端技术选型分析

> 日期：2026-08-12 · 状态：分析稿，待拍板
> 场景：开发部子站（dev.cyberswat.cn）前后端完备系统，承载公告发布 / 信息流转 / 轻量社区 / 点子墙

## 0. 需求特征（决定选型的输入）

| 特征 | 说明 | 影响 |
|---|---|---|
| CRUD 密集型 | 公告/帖子/评论/任务/点子/成员资料，全量增删改查 | 框架生态成熟度 > 极致性能 |
| 权限分层 | 访客/成员/部长/管理员，部门级隔离，邀请制激活 | 需要成熟的守卫/中间件/装饰器体系 |
| 实时通知 | @通知、公告推送、任务流转提醒 | 需要 WebSocket/SSE 支持 |
| GitHub OAuth 二级认证 | 邮箱主 + GitHub 绑定同步 | 需要 OAuth 客户端库 |
| 公安院校隐私约束 | 姓名/区队对外不可见，脱敏是硬需求 | 字段级权限控制 |
| 单机小规模 | 成员数十人，容器 8092 单端口 | 不需要微服务/复杂中间件 |

**结论：这是典型的"中型 TS 全栈 CRUD + 权限 + 实时通知"项目，性能不是瓶颈，开发效率和权限体系成熟度才是。**

## 1. 候选方案对比

### 方案 A：Node.js + NestJS（推荐 🥇）

```text
NestJS 11 + Prisma + PostgreSQL + socket.io + JWT
```

- **同语言全栈**：与前端 Vue3+TS 共享类型定义（DTO/实体可在 monorepo 里共用），前后端一个语言栈
- **权限体系一等公民**：Guard/Interceptor/Decorator 原生支持，`@Roles('admin')` 式声明，正好匹配"访客/成员/部长/管理员"四层权限 + 字段级脱敏拦截器
- **模块化**：公告/社区/任务/点子墙/成员各自一个 Module，边界清晰，后续 attack/forensics 等子站可复用骨架
- **生态成熟**：socket.io（@通知实时推送）、@nestjs/jwt、@nestjs/passport、OAuth2 库齐全
- **学习成本**：NestJS 的 DI/装饰器有概念门槛，但你是 TS 主力栈，上手一周内
- **与既有经验的关系**：class_mansys 的 Express 经验可平滑迁移（NestJS 底层就是 Express/Fastify）

### 方案 B：Node.js + Fastify + TS（次选 🥈）

```text
Fastify + TypeScript + Prisma + PostgreSQL + socket.io
```

- **轻量直白**：API 风格接近你熟悉的 Express（class_mansys 已验证），无 DI/装饰器魔法，写起来最快
- **性能好**：Fastify 吞吐高于 Express，自带 JSON Schema 校验
- **权限要手写**：没有 NestJS 的 Guard 体系，靠中间件 + 手写 helper，四层权限 + 字段脱敏要自己搭，规模大了容易散
- **适合**：想快速出活、成员规模小、权限逻辑简单；但本项目权限是核心需求，手写维护成本会随功能膨胀

### 方案 C：Go（Gin/Fiber）

- **优势**：性能天花板、单二进制部署、nexus-ctf 里用过 Fiber
- **劣势**：前后端两套语言，TS 类型无法共享（本项目 DTO 共享收益大）；CRUD 开发效率低于 TS（写结构体/手写校验/无 ORM 类型安全）；社区/公告这类业务 Go 生态优势发挥不出来
- **结论**：杀鸡用牛刀，且破坏全栈单一语言优势。❌

### 方案 D：Python（FastAPI）

- **优势**：开发快、后续接 AI 功能方便（mcp/agent 生态）、自动 OpenAPI 文档
- **劣势**：你的 Python 经验偏脚本/学习向（python-work 是练习，muliao 是 MCP 服务而非 Web 业务系统），生产级 Web 后端没有已验证项目；类型共享同样做不到
- **结论**：除非明确规划"子站要深度接 AI"，否则不如 TS 顺手。❌

## 2. 数据库选型

| | PostgreSQL 16（推荐） | MySQL 8 |
|---|---|---|
| 你的经验 | nexus-ctf 用过 | class_mansys 生产验证 ✅ |
| JSON 支持 | JSONB（索引/查询强）— 成员 links、标签、筛选友好 | JSON 有但查询弱 |
| 全文检索 | tsvector 内置 | 要 FULLTEXT，中文分词弱 |
| 枚举/数组 | 原生 | 无 |
| 部署 | 容器化简单 | 容器化简单 |

**推荐 PostgreSQL**：本项目多处需要 JSON 结构（`users.links: [{label,url}]`、项目字段模板、点子标签），JSONB + 数组类型直接命中；中文全文检索（社区帖子搜索）也是加分项。你的 MySQL 经验迁移到 PG 基本无痛（Prisma ORM 抹平差异）。

## 3. ORM 选型

- **Prisma（推荐）**：schema 即文档，迁移工具内置，TS 类型全自动生成（DB 类型 → 前端可共享），嵌套 CRUD（帖子→评论→点赞）写起来最舒服
- TypeORM：NestJS 官方文档示例用得多，但装饰器实体 + 手写迁移，类型推导不如 Prisma 干净
- Drizzle：更轻更 SQL 化，但生态和文档不如 Prisma

## 4. 认证方案（延续 PRD 已拍板决策）

- **主认证**：邮箱 + 密码（bcrypt，class_mansys 已验证），JWT（access + refresh）
- **二级认证**：GitHub OAuth（passport-github / @nestjs/passport），绑定后自动同步成员主页 GitHub 信息
- **激活**：邀请制（部长开号）或注册后审核，邮箱验证链接
- **脱敏**：对外 API 只出"昵称/方向/签名/链接"，姓名/区队/手机号字段仅内部可见（Guard + 序列化拦截器实现）

## 5. 推荐结论

```text
NestJS 11 (Fastify adapter 可选) + Prisma + PostgreSQL 16 + socket.io + JWT + GitHub OAuth
前端沿用 Vue3 + Vite + TS + Pinia（与主站同栈）
部署：独立容器 dev.cyberswat.cn:8092 → nginx 反代 → CF Tunnel（沿用主站模式）
```

**核心理由**：
1. 全栈 TS 单一语言，类型从 DB → API → 前端全链路共享（对"成员主页/项目卡片/点子"这类强结构数据收益最大）
2. NestJS 的 Guard/Interceptor 体系直接服务"四层权限 + 字段级脱敏"这个核心需求
3. 你的 Express（class_mansys）经验平滑迁移，TS 熟练度最高
4. 子站体系后续还有 7 个部门，这套骨架可复制（Module 化设计天然适合）

**备选**：若想最快出 MVP，方案 B（Fastify）砍掉权限复杂度可 2-3 天上线，但后续补权限体系时可能要重构。

## 6. 风险与缓解

| 风险 | 缓解 |
|---|---|
| NestJS 学习曲线 | 先用官方 CLI 脚手架 + 本项目规模不大，1-2 周可掌握 |
| PostgreSQL 首次生产使用 | Prisma 抹平差异；主站已用 Docker 容器化，本机即可演练 |
| 实时通知复杂度 | MVP 阶段用轮询/SSE，socket.io 二期再接 |
| 隐私合规 | 脱敏在 API 层统一做（拦截器），不依赖前端自觉 |
