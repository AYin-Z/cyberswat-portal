# 开发部子站 — 插件化架构调研与评估

> 日期：2026-08-12 · 状态：✅ 已落地（L0 全实现，2026-08-15 上线）
> 输入：DSH/Cordis 源码一手调研（本机 /home/ayin/.local/lib/node_modules/@deepseek-ai/dsh）+ 外部生态检索
> 决策上下文：用户认可"一切皆插件"哲学，未来要做部门 agent

## 1. 调研发现汇总

### 1.1 DSH/Cordis 源码一手证据（本机可查，非二手资料）

| 机制 | 源码证据 | 对子站的启示 |
|---|---|---|
| 内核 = 空 profile + 插件行 | dsh-base：*"every profile's first patch layer, inserting the base plugin rows over the empty profile root"* | 插件即配置行，状态可持久化、可叠加 ✅ |
| 服务注入组合 | `ctx.plugin` 注册 Service，dsh-client-* 全家互相注入消费 | 能力即服务，服务可组合 ✅ |
| 双面插件 | 包内声明 `dsh.client`，`window.__DSH_BOOT__` 引导图由扫描所有包声明**组合生成** | 前端插件化 = 声明驱动，非手写路由表 ✅ |
| 工具注册表 | dsh-tools：*"Tool registry and execution pipeline"*；工具带 `scope`(66处)/`approval`(20处)/`policy`(8处) | **工具权限/审批是内置一等公民**，非后补 ✅ |
| 工具作用域分层 | "scoped context (agent.ctx): a context-global restriction would mask every agent" | agent 级工具可见性 = 权限范围的实现原型 ✅ |
| MCP 桥接 | dsh-mcp-client：*"connects to MCP servers and registers their tools on ctx.tools"*，基于官方 `@modelcontextprotocol/sdk` | **MCP 已是标准接入层**，官方 SDK 成熟（DSH 生产在用）✅ |
| Schema 校验 | dsh-tools 用 `schemastery` + JSON Schema 断言（assertObjectJsonSchema 等） | 工具入参校验有成熟模式 ✅ |

### 1.2 外部生态调研

| 技术点 | 生态现状 | 结论 |
|---|---|---|
| NestJS 插件化 | 动态模块（forRoot/forFeature）官方一等公民；社区有 [nestjs-microkernel-architecture-template](https://explore.market.dev/ecosystems/typescript/projects/nestjs-microkernel-architecture-template)、[@golevelup/nestjs-modules](https://www.npmjs.com/package/@golevelup/nestjs-modules) 等微内核实践 | 可行，有先例；但无 Cordis 级运行时加载器，需自建轻量加载层 |
| MCP SDK | 官方 [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) TS 版成熟；MCP 已成 AI 工具接入事实标准 | 直接用，零风险 |
| MCP 权限 | 社区共识 = [least-privilege 授权](https://github.com/JSONbored/awesome-claude/blob/main/content/guides/mcp-server-auth-least-privilege.mdx)、[工具级 scoping](https://policylayer.com/blog/mcp-authorization)、AI Gateway 治理（[Kong 方案](https://konghq.com/blog/engineering/mcp-tool-governance-security-meets-context-efficiency)） | 我们的"agent 权限范围 = 工具可见性"设计与社区最佳实践一致 |
| Prisma 多 schema | [prisma-merge](https://www.npmjs.com/package/prisma-merge) / prismerge 等合并工具存在 | 可用但非官方、维护活跃度一般 → **备选**，首选"核心 schema + 插件自有表"模式（见 §3.5） |
| Vue3 前端插件化 | 动态路由/菜单/插槽方案成熟；重型可上 qiankun 微前端或 Vite 联邦模块（[参考](https://juejin.cn/post/7633750462006313010)） | 我们只需 manifest 驱动（轻量），不需要微前端 |

## 2. 评估结论（先行版）

**✅ 总体可行，且证据充分**：
- 哲学层面：DSH 已生产验证"内核 + 插件行 + 服务注入 + 双面插件 + 工具注册表 + MCP 桥接"整套模式
- 生态层面：NestJS 动态模块 + 官方 MCP SDK + Prisma 均为成熟组件，无自研框架风险
- 关键风险不在"能不能"，在"边界在哪"——评估给出明确切分

**⚠️ 必须诚实标注的三个代价**：
1. **抽象税**：L1 配置化启停、L2 热加载会显著增加架构复杂度，若业务没到规模就是过度设计
2. **Prisma schema 合并是生态盲区**：官方不支持多 schema 文件，社区工具不活跃 → 需要务实方案（§3.5）
3. **新人接手门槛**：换届后新成员要先理解"插件"心智模型，需要配套文档/模板

## 3. 五个扩展点逐项评估

### 3.1 事件总线 EventBus — ✅ 低风险，立即做

- **方案**：NestJS 官方 `@nestjs/event-emitter`（基于 Node EventEmitter，进程内同步/异步事件），**不引入消息队列**（Kafka/RabbitMQ 是分布式场景，单容器小规模是杀鸡用牛刀）
- **事件命名**：`announcement.published` / `task.status.changed` / `idea.promoted` / `post.mentioned`（领域.动作 格式，与 DSH 工具命名风格一致）
- **消费方**：通知中心（站内通知）、agent 订阅、审计日志
- **风险**：无。进程内事件零运维成本；未来若多实例再换消息队列，事件语义不变（接口隔离）

### 3.2 工具注册表 ToolRegistry + MCP — ✅ 低风险，价值最高

- **方案**：
  ```
  能力包注册工具 → ToolRegistry（入参 JSON Schema 校验 + 权限点检查 + 审计）→
  MCP Server 端点（@modelcontextprotocol/sdk 官方实现）暴露给外部 agent
  ```
- **双面**：子站内部 agent（插件形式）直接调 ToolRegistry；外部 agent（Claude/自研）走 MCP 端点——同一套工具，两种入口
- **权限模型**（对齐 DSH 的 scope/approval 设计）：
  - 工具声明 `requiredPermission: 'idea.view'`，执行前 RBAC 校验
  - agent 插件声明 `tools: [...]` 白名单 = 可见性即权限（DSH："scoped context per agent"）
  - 危险操作（创建公告/指派任务）可声明 `requiresApproval: true`，走审批流程
- **实现参考**：DSH 的 dsh-tools 源码就是现成蓝本（scope/approval/policy 三件套）
- **风险**：低。官方 SDK + DSH 生产验证。唯一注意：MCP 端点鉴权要接我们的 JWT（不是裸暴露）

### 3.3 UI 贡献点（前端插件化）— 🟡 中风险，分两档

- **L0（现在）**：manifest 驱动静态注册——每个能力包前端模块导出 `routes/menu/slots` 声明，构建时合并（对应 DSH 的 `window.__DSH_BOOT__` 组合生成模式）。Vue3 下就是 `router.addRoute()` + 菜单数据源 + `<component :is>` 插槽，全部是成熟 API，无框架创新
- **L1+（远期）**：运行时动态注册（远程组件/联邦模块）——复杂度陡增，**明确不做**，除非出现"外部开发者独立开发插件"的真实需求
- **风险**：L0 无风险；要警惕的是"顺手把 L1 也做了"的冲动——用 `Vue3 + Vite 联邦模块`（[参考](https://www.cnblogs.com/cn-oldboy/p/19539885)）之前先问"谁在写独立插件？"
- **决策**：**前端插件化锁定 L0**，manifest 合并，禁止运行时加载

### 3.4 权限点系统 — ✅ 低风险，核心收益

- **方案**：能力包声明 `permissions: [...]`（如 `idea.promote`），NestJS 自定义 Decorator + Guard 检查（`@RequirePermission('idea.promote')`），数据存 `permission` 表（角色→权限点映射）
- **与认证关系**：RBAC（角色：访客/成员/部长/管理员）+ 权限点（细粒度），角色是权限点的集合
- **脱敏**：序列化拦截器按角色裁剪字段（复用现有设计）
- **风险**：低，纯工程实现；注意权限点命名空间约定（`<domain>.<action>`）防止部门间冲突

### 3.5 数据模型合并 — 🟡 唯一真技术难点

- **问题**：Prisma 官方是单 schema 文件，插件自带 schema 片段需要合并机制
- **三个候选方案**：

  | 方案 | 做法 | 评价 |
  |---|---|---|
  | A. 构建期合并（prisma-merge） | 各插件 `schema/*.prisma` 片段，构建脚本合并成单一 schema | ⚠️ 工具非官方、活跃度一般；合并冲突难调试 |
  | B. **核心 + 插件表分离（推荐）** | 核心 schema 管用户/权限/事件；**每个插件建自己的表**（`idea_wall_ideas`），插件表之间通过核心 `id` 关联，不互相引用 | ✅ Prisma 单 schema 装核心模型 + 插件模型（仍是编译期一个 schema 文件！），**插件表用独立命名空间**，新增插件 = 往 schema 加一组模型 + 迁移 |
  | C. JSONB 扩展字段 | 插件扩展字段塞核心表的 JSONB | 适合少量扩展，复杂查询弱 |

- **推荐 B 的实质**：**"编译期合并"而非"运行时合并"**——所有模型仍在一个 Prisma schema 里（Prisma 正常工作），但**按插件命名空间分组组织**（`.prisma` 文件用 `///` 注释分区），新增插件时改 schema + 跑迁移。这其实**不是插件化难题，而是工程规范问题**——与 L0"代码级插件"完全自洽
- **结论**：L0/L1 阶段用方案 B（工程规范），**不引入合并工具**；只有 L2 出现"第三方插件"才需要评估方案 A。风险可控 ✅

### 3.6 插件加载器（生命周期）— 分阶段评估

| 阶段 | 加载方式 | 评估 |
|---|---|---|
| L0 | 编译期：能力包 = NestJS Module，`app.module.ts` 注册列表 | ✅ 零风险，现在就这么写 |
| L1 | 配置驱动：DB `plugins` 表存启用状态，启动时按配置组装 Modules | 🟡 中风险：NestJS 动态模块可以做到（forRoot 接收配置），但"禁用公告模块"的真实场景很少——**建议只做"启用/禁用"不做"热加载"** |
| L2 | 运行时热加载（独立 npm 包安装） | ❌ 明确不做：NestJS 无 Cordis 级 loader，自研成本高、收益不确定；真到那天再评估 |

## 4. 部门 agent 专项评估

### 4.1 形态（已明确）

```
子站内置 agent = 一个插件：persona + tools 白名单 + 事件订阅 + 身份(bot:dev-assistant)
外部 agent 接入 = MCP 端点（ToolRegistry 统一暴露）
```

### 4.2 关键技术点评估

| 点 | 评估 |
|---|---|
| 工具来源 | 能力包注册（内部）+ MCP 端点（外部），同源同权限 ✅ |
| 身份与审计 | agent 以 `bot:*` 系统成员身份操作，所有工具调用落审计表（谁/何时/调了什么/参数）——**公安院校场景审计是硬需求** ✅ |
| 审批 | 声明 `requiresApproval` 的工具走"部长确认"流程，agent 永不越权 ✅ |
| 会话 | MVP 不做 agent 前台交互界面（聊天 UI），先做"后台 agent"（订阅事件主动干活）；交互界面 L2 再说 |
| 模型接入 | 预留：走 OpenAI 兼容 API 或 MCP host 模式，模型供应商可换（部门预算敏感） |

### 4.3 风险

- **幻觉写数据**：agent 创建的内容（公告草稿/任务描述）默认"草稿态"，人工确认后生效——**任何 agent 写操作都过审批**，这条写死
- **prompt 注入**：社区帖子内容可能诱导 agent——工具入参校验 + 输出仅限结构化数据 + agent 不执行"帖子里的指令"
- **成本**：agent 调用是持续成本，MVP 阶段默认关闭或仅管理员启用

## 5. 修订后的落地路径

```
L0（M0-M2，现在）  代码级插件：NestJS Module + manifest.ts 声明
                   扩展点：EventBus(event-emitter) + ToolRegistry(JSON Schema校验+权限点) 
                          + 权限点 Decorator + 数据模型命名空间规范
                   前端：manifest 驱动静态合并（routes/menu/slots）
                   ⚠️ 明确不做：运行时加载、远程组件、消息队列

L1（M3-M4）        配置驱动启停（DB plugins 表，启动时组装）
                   MCP 端点上线（官方 SDK + JWT 鉴权）
                   部门 agent v0：后台 agent（事件订阅 + 工具调用 + 草稿态写操作 + 审计）

L2（远期，条件触发）独立插件仓库 / 热加载 / agent 前台交互 —— 有真实需求再启动
```

## 6. 落地验证（2026-08-15）
- ✅ 五个扩展点全部按 L0 实现：事件总线(event-emitter)/工具注册表(8工具含审批+审计)/UI贡献(manifest 组合)/权限点(Decorator+Guard)/数据模型(命名空间规范)
- ✅ 部门 agent 预留：invite.create / announcement.publish / task.create 三个 agent 工具带审批 + 全量审计，MCP 端点未接（L1）
- ✅ 纪律遵守：未引入运行时加载/消息队列/微前端/prisma 合并工具
- ⚠️ 实测偏差记录：socket.io 全员广播需客户端 join 'all' room（gateway 实现细节）

## 7. 最终评估结论

| 维度 | 结论 |
|---|---|
| 可行性 | ✅ 高——DSH 生产验证的整套模式 + NestJS/MCP/Prisma 成熟组件，无自研框架 |
| 最大价值 | ToolRegistry + 权限点 + 事件总线三件套，让"部门 agent"从"以后要做"变成"插件式的自然扩展" |
| 最大风险 | 抽象过度（L1/L2 冲动）+ Prisma 多 schema 生态盲区（用方案 B 规避） |
| 核心纪律 | **L0 锁定代码级插件，禁止提前上运行时机制**；agent 写操作一律审批 + 审计 |
| 架构决定 | 前端锁定 manifest 静态合并；事件用进程内；MCP 用官方 SDK；数据模型用命名空间规范而非合并工具 |

**一句话**：插件化不是"加一个框架"，而是**五条扩展点纪律**（事件/工具/UI/权限/数据）——L0 全部零成本落地，部门 agent 在 L1 自然长出。
