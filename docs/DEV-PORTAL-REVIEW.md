# CyberSWAT 开发部子站 — 两轮迭代全面 Review 报告

> 评审对象：cyberswat-dev-portal（dev.cyberswat.cn，已上线）· NestJS 11 + Prisma + PostgreSQL 16 + socket.io + Vue3 + Naive UI
> 评审方式：四视角（前端/后端/系统/产品）× 全量源码逐行阅读 + 线上容器/数据库实测核对 + 文档基线比对
> 评审日期：2026-08-15 · 状态：✅ 已修复并验收（2026-08-15 晚，全部 47 项修复完成，本地 e2e 15/15 + 生产线上实测通过）
> 修复提交：cyberswat-dev-portal @ 9ad4d86（详见该仓库提交信息与 AGENTS.md）
> 路径前缀：`api/` = `apps/api/src/`，`web/` = `apps/web/src/`，未标注均为仓库根或 `packages/shared/`

---

## 1. 总体评价

两轮迭代的**交付完整性高于一般自研项目**：R1 人力匹配主链路（资料→词表→匹配→通知）闭环达成，R2 的 MCP/OAuth2.1/DCR/双限额/审批工作台骨架全部上线并有真实生产调用记录；凭证轮换、令牌哈希、脱敏双视图、三层权限守卫、备份 cron 等"安全必做项"确实落地。但**安全与可靠性的关键支柱名不副实**：审计与审批队列实际只在内存、`core_tool_calls` 表零写入；GitHub OAuth 自动建号使邀请制形同虚设；OAuth 授权缺确认页与 scope 校验；前端 12 个交互页面因缺 `n-message-provider` 在挂载期抛错；部署 compose 与线上环境漂移、web/api 无自动重启。整体处于"功能完整、体验可用、安全欠账"的中间态——**不是不能跑，而是经不起审与事故**。

**健康度评分：65 / 100**（R1 达成度 78，R2 达成度 55，安全面 52，工程健壮性 58，产品体验 60）

---

## 2. 按严重级别的问题清单

### 🔴 严重（必须修，共 10 项）

**🔴-1 全站 12 个交互页面 mount 即抛错白屏：缺 `<n-message-provider>`**
- 位置：`web/App.vue:54-104`（只包 `n-config-provider`，无 message/dialog provider）；12 个视图在 setup 顶层调用 `useMessage()`（精确行号）：`AnnouncementNewView.vue:10`、`AgentView.vue:8`、`ApprovalsView.vue:20`、`InvitesView.vue:21`、`IdeaDetailView.vue:33`、`IdeaNewView.vue:10`、`ModerationView.vue:21`、`ProfileView.vue:9`、`PostDetailView.vue:9`、`PostNewView.vue:10`、`ProjectDetailView.vue:22`、`TaskBoardView.vue:24`
- 证据：naive-ui@2.44.1 `es/message/src/use-message.mjs` 明确 `if (api === null) throwError(...)`；全仓库 grep 无任何 `n-message-provider`
- 影响：发帖/发点子/发公告/任务看板/资料/审批/Agent 接入等核心交互页**组件挂载失败、内容区空白**（仅 Home/Members 等不调用 useMessage 的列表页正常）——与"生产验收通过"相矛盾，需核对线上产物是否与源码一致
- 修复：`App.vue` 内包 `<n-message-provider><n-dialog-provider>`（约 3 行）；验收流程补"页面冒烟"环节

**🔴-2 邀请制被 GitHub OAuth 自动建号绕过：任何人可注册为成员**
- 位置：`api/core/auth/github-auth.controller.ts:19-27`（公开 `/api/auth/github/login`）；`api/core/auth/auth.service.ts:92-108`（githubId 未命中即"自动建号"，角色 MEMBER，邮箱占位 `xxx@github.local`）；`web/views/LoginView.vue:73`（登录页公开该入口）
- 证据：PRD.md:30 明确"GitHub 无法证明网特身份，邮箱注册也必须审核"；AGENTS.md 记录"GitHub 登录 → 自动建号（AYin-Z → Ayin, MEMBER）"为预期行为——与邀请制决策直接冲突
- 影响：任何 GitHub 用户一键注册为内部成员，可看全部成员资料/技能/外链、发帖、参与协作；公安院校内部平台的成员边界被击穿
- 修复：GitHub 仅用于**已存在账号的绑定/快捷登录**；新用户走邀请注册或转入部长审核队列

**🔴-3 审计铁律名存实亡 + 审计/审批接口对全体成员开放**
- 位置：`api/core/tools/tool.registry.ts:28`（`records: ToolCallRecord[]` 纯内存）、`:95/104/109`（只 push 内存）；`schema.prisma:74-87` 的 `core_tool_calls` 表**全库零写入**（线上实测 0 行，而系统已真实跑过 MCP 调用）；`api/core/tools/tools.controller.ts:35-44` 的 `GET /api/tools/audit` 与 `GET /api/tools/pending` **无任何权限装饰器**（仅 :47-54 处置接口做了角色校验）
- 影响：(a) 重启即丢全部审计与待审批队列，"全量审计铁律"不成立；(b) 任意登录成员可读全量工具调用参数/结果，**含 `invite.create` 返回的明文邀请链接**——拿到即自行注册新成员；(c) e2e 里对 audit 的断言是内存态假阳性
- 修复：`call()/resolveApproval()` 落库 `coreToolCall.create`；`audit/pending` 加 `@Authorize('audit.view')`（仅 dept-leader/admin），pending 仅返回可处置项

**🔴-4 JWT_SECRET 公开默认值回退 ×5：可离线伪造任意角色令牌**
- 位置：`api/core/auth/jwt.strategy.ts:20`、`api/core/auth/auth.module.ts:13`、`api/core/gateway/gateway.module.ts`、`api/core/oauth/oauth-server.provider.ts:11/171/198`、`docker-compose.yml:24`（`JWT_SECRET=${JWT_SECRET:-dev-secret-change-me}`）
- 证据：线上实测容器 JWT_SECRET 已轮换为 64 字符强随机（此项本身 ✅）；但代码与 compose 的兜底默认值仍在——任何一次漏配 env 的部署（含按仓库 compose 直接 up）都会以公开密钥签发/验签
- 影响：认证体系整体沦陷（自签 ADMIN 令牌），且**静默失败**（无启动校验）
- 修复：启动时硬校验 `JWT_SECRET` 缺失/等于已知默认值即 `process.exit(1)`；compose 改 `${JWT_SECRET:?}`；auth/oauth/gateway 四处去掉兜底

**🔴-5 OAuth 授权链 scope 隔离失效 + 审批"批准即失败"**
- 位置：(a) `api/core/oauth/oauth-server.provider.ts:45-86` authorize 见会话 cookie 即自动签发 code——**无授权确认页**（DESIGN #9 承诺的"权限点逐项勾选、默认只读"不存在），`:75-76` scope 取客户端请求值原样落库，不校验 ⊆ 成员实际权限；(b) `oauth-server.provider.ts:135-163` refresh 请求 `scopes ?? row.scope`（:146）**可自提更大 scope**，无子集校验；(c) `api/core/mcp/mcp-tools.bridge.ts:85-86` 与 `tool.registry.ts:129` 硬编码 `role:'member'` + `skipRoleCheck:true` → dept-leader 的 agent 走 `task.create` 审批通过后，执行时仍被 `api/capabilities/project/project.service.ts:220/195-199` 以 member 身份拒绝
- 影响：(a) 开放 DCR + 自动放行 + 无 state → 诱导已登录成员点击构造的 `/authorize` 链接即可静默授权攻击者客户端（授权 CSRF）；(b) scope 声明可膨胀到任意权限点（写工具靠审批兜底，只读面无兜底）；(c) **干部 agent 的写审批"批准即失败"**，R2 核心链路自相矛盾
- 修复：补授权确认页（展示客户端+逐项勾选）；authorize 时 scope 与 owner 角色权限取交集；refresh 的 scope 必须 ⊆ 原 scope；审批记录 owner 真实角色并在执行时按该角色执行

**🔴-6 冻结用户级联撤销是死代码 + OAuth refresh 不校验用户状态**
- 位置：`api/core/oauth/oauth-server.provider.ts:187-192`（`revokeUserTokens` 定义后**全库无任何调用点**，且全系统无冻结用户 API）；`:135-163` 的 `exchangeRefreshToken` 不校验 `user.active`（对比主会话 `auth.service.ts:67` 有校验）
- 影响：DESIGN #8/R2 DoD"冻结用户 → 级联撤销 refresh token"完全落空；被停用成员可继续经 MCP refresh 换取新 access token **长达 30 天**访问数据；主会话 JWT 也有 ≤15 分钟残留窗口
- 修复：补 `POST /api/users/:id/freeze`（active=false + 撤销主会话 refresh + revokeUserTokens）；OAuth refresh 交换前查 user.active

**🔴-7 邀请：dept-leader 可创建 ADMIN 角色邀请 + 名额并发击穿**
- 位置：`api/core/invites/invite.controller.ts:11-12`（`@IsEnum(CoreRole)` 含 ADMIN）；对比 `api/core/kernel.module.ts:82` 工具参数枚举仅 `MEMBER/DEPT_LEADER`（两路径自相矛盾）；`api/core/invites/invite.service.ts:56-73` validate（读 usedCount）→ 建号 → consume（increment）非原子
- 影响：(a) dept-leader 直接开 ADMIN 邀请 → 提权路径（违反最小权限）；(b) `maxUses=1` 的邀请在并发注册下可双双通过 validate → 名额失效，招新批量名额可被击穿
- 修复：角色白名单（非 admin 只能开 MEMBER）；`updateMany({ where: { id, usedCount: { lt: maxUses }, revoked: false, expiresAt: { gt: now } }, data: { usedCount: { increment: 1 } } })` 原子消费

**🔴-8 前端 token 生命周期断裂：15 分钟强制登出、刷新即丢身份、保存资料洗掉 user**
- 位置：`web/stores/auth.ts:19-30`（登录只存 accessToken，**丢弃 refreshToken**）；全前端无 `/api/auth/refresh` 调用、无 401 全局拦截（后端 `auth.controller.ts:57-63` 有 refresh 接口但无人用）；`web/views/LoginView.vue:33-46` 仅 GitHub 流程拉 /me，**正常登录与刷新页面后 `auth.user` 恒为 null**；`web/capabilities/profile/ProfileView.vue:69` `auth.user = { ...auth.user!, nickname }`——user 为 null 时展开为空对象，保存一次资料后 id/role 全部丢失
- 影响：access token 15 分钟（`auth.service.ts:113`）过期后全站 401 失效需重新登录；刷新页面后角色相关 UI（删除/验收按钮等）全部失效；资料保存后用户身份被"洗掉"
- 修复：持久化 user + 启动时拉 `/api/auth/me`；封装统一 fetch：401 时用 refreshToken 自动续期并重放；修复 ProfileView 的 user 合并

**🔴-9 认证/令牌端点零速率限制：可在线爆破与撞库**
- 位置：`api/core/auth/auth.controller.ts:40-63`（login/register/refresh 全 `@Public` 无 throttler）；项目依赖无 `@nestjs/throttler`/`express-rate-limit`；`deploy/nginx-dev.conf` 全文无 `limit_req`
- 影响：登录仅 bcrypt 比对、无账号/IP/次数维度节流；公安院校邮箱规律性强，字典命中率高；DCR/refresh 端点可被刷库
- 修复：登录/refresh/注册加双维度限速+指数退避；nginx 对 `/api/auth`、`/oauth/token`、`/oauth/register` 加 `limit_req`；可叠加 CF WAF/Turnstile

**🔴-10 GitHub OAuth：无 state + token 走 URL query + access token 明文入库**
- 位置：`api/core/auth/github-auth.controller.ts:25`（授权 URL 无 `state`）、`:73-76`（`res.redirect(\`/login?token=...\`)` 是 **query**，注释却写"URL fragment 传递"）；`api/core/users/users.service.ts:136-150`（`updateGithub` 直写 `githubToken` 明文，线上已有值）；`schema.prisma:33`（注释称"加密存储，M1+"，实际从未实现）
- 影响：(a) 登录 CSRF——攻击者可诱导受害者浏览器完成一次由攻击者发起的 GitHub 授权，把攻击者身份绑定到受害者邮箱或让受害者登录进攻击者账号；(b) access token 进 nginx/CF 访问日志、浏览器历史、Referer；(c) DB/备份泄露 = GitHub 凭据泄露且永不过期
- 修复：加 state（随机值+服务端校验）；token 改 `#token=` 或 POST 回传；nginx access_log 对 `/login` 脱敏；githubToken 加密（AES-256-GCM，独立密钥）或改为仅存短期换取态

### 🟡 重要（应修，共 22 项）

**🟡-1 审计/审批/限额全部进程内存态，MCP 会话无上限**
`tool.registry.ts:28`（records）、`mcp-tools.bridge.ts:39`（rateMap）均为内存 Map：重启即清零限额（读 30/写 5 每时护栏失效）、丢审批队列；`api/core/mcp/mcp.module.ts:25/78-91` 的 `sessions` Map 无 TTL/清扫，客户端消失即永久泄漏。修复：限额/会话落库或加 TTL 清扫。

**🟡-2 双限额只覆盖 MCP 通道，且"超限进审批"实现为直接拒绝**
`mcp-tools.bridge.ts:97-109` 超限直接 throw（DESIGN #5 承诺"超限进审批"）；HTTP 工具通道（`tools.controller.ts:31` `skipApproval:true`）与 bot 通道（`dev-assistant.service.ts:81` 直调 `tools.call`）完全无限额——聚合攻击防护不完整，限额按 userId 而非 agentId 计数。

**🟡-3 /agent 接入页主 CTA 是死链 + 无授权管理**
`web/capabilities/agent/AgentView.vue:71` 授权链接 `client_id=manual` 在客户端存储中**不存在**（DCR 注册的 id 均为 `agent-<hex>`），SDK 校验 client 时必失败；R2-C DoD 的"授权状态管理（已授权客户端/撤销）"未实现。

**🟡-4 审批请求不通知部长，工作台入口对全员可见**
`tool.approval.requested` 事件（`tool.registry.ts:96`）**无任何订阅者**（ITERATION-R2 §4.5 承诺的通知联动未实现）→ 部长不知道有待审批项；`approvals.ui.ts:7`/`moderation.ui.ts:7`/`invites.ui.ts:7` 菜单对所有成员可见（点进去 403）。

**🟡-5 点子详情对第 100 条之后的点子返回残缺数据**
`api/capabilities/idea-wall/idea.service.ts:115`：`(await this.list(viewerId)).find(...)` 依赖 list 的 `take:100` 截断，点子总量超 100 后详情丢标题/描述，只剩 joiners。

**🟡-6 任务看板拖拽不生效（旗舰交互名存实亡）**
`web/capabilities/project/TaskBoardView.vue:151-160`：`@end` 事件绑定在**起始列**的 draggable 上，`move(t, col.key)` 的 col 是源列 → `if (task.status === toStatus) return` 恒 no-op；且 `:list="colTasks(col.key)"` 是计算属性新数组，拖拽排序不落任何状态；`move()` 仅支持相邻正向流转（:68-101）。FRONTEND.md 调研修正④ 承诺的 GitHub Projects 式拖拽未实现。

**🟡-7 仪表盘 KPI 失真且"我的任务"实为全员任务**
`web/views/HomeView.vue:64-67` 先 `slice(0,6)` 截断再算 KPI（:45-50）→ 计数错；后端 `api/capabilities/project/project.service.ts:293-305` `listTasks` 无 viewer 过滤，"我的任务"返回全系统任务。

**🟡-8 通知闭环断裂：不跳转、不单条已读、新通知强改 URL**
`web/components/NotificationBell.vue:24` `location.hash = d.link` 与 `createWebHistory`（`router/index.ts:15`）不兼容（跳转不生效，且推送即改 URL 打扰正在填表的用户）；通知项无点击跳转/单条已读（R1-P3 DoD 三缺二，API `/read/:id` 存在但无人用）。

**🟡-9 socket 实时只覆盖 3 类事件，评论/点赞/@提及/匹配通知仅落库不推送**
`api/core/gateway/notification.gateway.ts:82/101/128` 只监听 announcement.published / task.status.changed / idea.created；`NotificationService.notify`（`notification.service.ts:15-31`）不发事件 → 用户感知"有时实时有时不实时"。

**🟡-10 bot 回复不通知 @ 发起人**
`api/capabilities/bot/dev-assistant.service.ts:113-124` 直接 `postComment.create`，无 notify、无 socket 推送 → 成员 @bot 后必须刷新帖子才能看到回答，触发闭环断裂。

**🟡-11 AI 署名 authorViaAgent 字段不存在，角标靠 🤖 文本启发式**
`schema.prisma` 的 Post/PostComment/Idea 均无 `authorViaAgent`（DESIGN #11 落空）；`web/capabilities/community/PostDetailView.vue:119` `c.content.includes('🤖')` → 用户手写 🤖 即误标"AI 代发"；bot 回复同时有文本尾巴 `— 🤖`（`dev-assistant.service.ts:120`）与角标，信息重复。

**🟡-12 生产 compose 与线上漂移：按仓库部署直接断网，web/api 无自动重启**
`docker-compose.yml`：dev-web **无 `networks:` 键**（进默认网络，与 dev-api 不互通）→ `nginx-dev.conf:18` 的 `proxy_pass http://dev-api:8093` DNS 解析失败；`:25` DATABASE_URL 硬编码 `cyberswat:cyberswat` 弱口令、`:44` 的 `DB_PASSWORD` 变量对 API 无效；线上实测三容器均为手工 `docker run`（无 compose label），**web/api restart policy = no**（仅 db 为 unless-stopped）→ 宿主重启即整体宕站。

**🟡-13 生产测试账号弱密码写进文档并存在于线上**
`AGENTS.md:51` 记录 `leader@cyberswat.cn / member@cyberswat.cn / password123`，线上实测两账号存在且活跃——公开文档+弱口令=持久后门式风险。

**🟡-14 e2e 测试无强制测试库隔离，可能清空开发/生产库**
`api/test/e2e.spec.ts:23-38` beforeAll 直接 `deleteMany` 清 8 张表，连接的是 `DATABASE_URL` 默认值；"测试库 cyberswat_test"仅是口头约定（AGENTS.md:91），代码无校验；若 shell 里 export 了生产 URL 即删生产库；且清表不全（core_mentions/core_oauth_*/core_agents 未清，测试间互污染）。

**🟡-15 R1-P1 校验缺失：skills 无 ≤10、links 无 ≤5、url 无格式校验**
`api/core/users/me.controller.ts:7-20` 仅 MaxLength，无 `@ArrayMaxSize`/`IsUrl`/协议白名单——与 ITERATION-R1.md:30 的 DoD"skills 数组上限 10, links 上限 5 且 url 格式校验"不符；`user.profile.updated` 事件也未发（R1-P1 承诺）。

**🟡-16 事件契约漂移：声明的事件未实现或空载荷**
`post.mentioned` 声明于 `packages/shared` 契约但 `community.service.ts:181-204` 直接写库不 emit；`idea.service.ts:218` `setStatus(PROMOTED)` emit `idea.promoted` 带 `projectId: ''` 空值（真正转正在 `project.service.ts:151`）；`example.capability.ts` 的 `user.created` 订阅用 `console.log` 裸输出。

**🟡-17 重要公告"确认收到"前端死代码：核心功能无操作入口**
`web/capabilities/announcement/AnnouncementListView.vue:46-52`（`confirm()` 函数定义）、`:57-85`（模板只渲染"（待确认收到）"提示，**无任何确认按钮调用**）——README 功能表与 R1 验收承诺的"重要公告需确认收到"闭环在 UI 层断裂：成员看到"待确认"却无法确认，只能手工调后端 API（`POST /api/announcements/:id/confirm` 存在但无人用）。修复：`a.important && !a.confirmed` 时渲染确认按钮绑定 `confirm(a)`，加 loading 态。

**🟡-18 refresh 轮换链方向写反 + 无重用（reuse）检测**
`auth.service.ts:74` 把旧 token id 传参，`issue()`（:111-125）却把该参数写进**新行**的 `replacedBy`（:121）——新 token 指向旧 token，而旧行 `replacedBy` 恒为 null，与 `schema.prisma:124` 注释"轮换后的新 token id（审计链）"方向相反；且已 revoke 的旧 token 再次被提交（被盗重放信号）只抛 401，不级联撤销整条链。影响：审计链无法从旧到新追踪；token 被盗后的重放无法被发现/止损。修复：先建新 token 拿 id，事务内更新旧行 `{ revoked: true, replacedBy: newId }`；检测到已 revoke token 重放时撤销该 userId 全部 refresh（family 撤销）。

**🟡-19 OAuth 客户端密钥校验是死代码：confidential client 语义失效**
`oauth-clients.store.ts:21` `client_secret: c.secretHash ? undefined : undefined`（假三元，恒返回 undefined）；`verifySecret()`（:66-70，唯一真正比对 sha256 的代码）在 SDK 中无任何调用点（SDK 的 clientAuth 中间件仅在 `client.client_secret` 存在时才比对）。影响：DCR 下发的 client_secret 对 token 端点完全无效——知道 `client_id`（64bit 熵，但可从日志/审计/前端配置泄露）即可冒充该客户端。修复：接入自定义 clientAuth 中间件调用 verifySecret，或明确按 public+PKCE 客户端处理并声明。

**🟡-20 OAuth access token 可跨界访问 `/api/me` 获取内部档案——隐私红线面**
`jwt.strategy.ts:24-26` validate 无 typ/aud 区分，OAuth access token（HS256 同密钥）也能通过验签；`permission.guard.ts:39-54` 对**无权限元数据**的路由（如 `me.controller.ts:28-32` 的 `@Authorize()`）直接放行 → 持有 MCP access token（经 🔴-5a 钓鱼路径即可获得）的人可调 `/api/me` 读到受害者的 realName/teamInfo/email 内部档案。修复：JWT 加 `typ:'app'|'oauth'` 声明并在 JwtStrategy 校验；OAuth token 独立密钥 + `aud`。

**🟡-21 "软删除"实为内容销毁：原文被覆写不可恢复**
`moderation.service.ts:68-81` 直接把 title/content 替换为 `[已删除]` 标记——注释声称"软删留审计"，实际原文永久丢失（误删无法恢复、举报审计看不到原文），且 `[已删除]` 行仍出现在搜索/列表。修复：加 `deletedAt/deletedBy` 字段 + 查询过滤 `deletedAt: null`，原文保留（或迁归档表）。

**🟡-22 任务认领：任意成员可抢已被指派的 TODO 任务 + 并发双认领竞态**
`project.service.ts:245-256` `claim()`：`assigneeId: task.assigneeId ?? userId`——被部长指派给某人的 TODO 任务**任何成员都能抢走**（无指派人校验）；并发双 claim 均读到 assigneeId:null 各自成功，任务实际归最后写入者。修复：claim 仅允许"无指派人"或"被指派人本人"；原子条件更新 `updateMany({ where: { id, status: 'TODO', assigneeId: null }, ... })` 校验 count==1。

### 🟢 建议（可延后，共 15 项）

- **🟢-1** MCP express app（`mcp.module.ts:36-113`）无 helmet/安全头，`/oauth/token|register` 无独立限速（SDK 仅 authorize 内置 100/15min）；OAuth access token 与站点 JWT 同密钥无 aud/iss 隔离（`oauth-server.provider.ts:14-22`）
- **🟢-2** 无 `.dockerignore`（构建上下文含 613M node_modules + .git，构建慢）、`Dockerfile.api` 以 root 运行（建议 `USER node`）、镜像恒 `latest` 无版本 tag 无法回滚
- **🟢-3** 备份脚本在仓外（`~/scripts/cyberswat-backup.sh`，未版本化）；备份文件权限 664 含姓名/区队/邮箱明文 PII；与库同机无异地；无恢复演练（pg_dump 走 socket trust，脚本中 DB_PW 变量实为死代码）
- **🟢-4** 4 张表无限增长无清理任务：`core_notifications`（每条公告 × 全员插入）、`core_oauth_codes/tokens`、`core_refresh_tokens`、`core_invites`
- **🟢-5** 迁移缺 8 处 FK 列索引（announcements.authorId、posts.authorId、comments.authorId、projects.leadId、tasks.creatorId 等）；`String[]`/Json 列无 GIN 索引，成员 200+ 后匹配（`idea-match.service.ts:41-69` 全量拉取 + 逐人 count）变慢
- **🟢-6** nginx 无 `server_tokens off`/CSP/X-Frame-Options/HSTS/gzip；`location ~ ^/(mcp|oauth|...|\.well-known)` 正则后续新增根路径路由会被静默劫持到 8094
- **🟢-7** example 能力包（`example.ping`/`example.dangerous`，后者无 requiredPermission + requiresApproval）随生产注册（`kernel.module.ts:21`）——`example.dangerous` 经 HTTP 直调 `skipApproval` 全员可执行
- **🟢-8** `@cyberswat/shared` 契约前端零使用（`MembersView.vue:7-16` 手抄 `PublicUserProfile`）；`@nestjs/config`、`@vicons/ionicons5` 依赖未用；`core_role_permissions`/`core_plugins`/`core_tool_calls` 三张表建而未用（L1 未接线）
- **🟢-9** `pnpm-workspace.yaml:8` `'@swc/core': set this to true or false` 占位符残留（allowBuilds 期望布尔值，悬空状态）
- **🟢-10** socket.io token 支持 `handshake.query.token` 传输（`notification.gateway.ts:39-41`，query 会进访问日志，建议仅 auth）；`cs_session` cookie 无 `secure`（`auth.controller.ts:9-16`）；`NotificationBell`/`ExampleView` 使用未定义的 `--panel/--border/--muted/--fg/--accent` CSS 变量（全局只有 `--cs-*`，样式静默失效）
- **🟢-11** `StatusBadge.vue:13/40-43` 的 `maps.generic` 回退分支实际不存在——未传 `type` 即对 undefined 取键抛 TypeError（当前所有调用点都显式传了 type，属潜伏缺陷）；`tokens.ts` 与 `main.css` 色值双源手动同步易漂移（Y 组已实际发生同类问题）
- **🟢-12** GitHub OAuth token 在前端 URL query 残留：`LoginView.vue:33-37` 读取 `route.query.token` 后直到 `router.replace('/')` 才清除，失败分支（:44-46）token 残留 URL → 进浏览器历史/分享链接，15 分钟有效期内可被窃用（与 🔴-10 服务端侧问题同源，建议读完立即 `history.replaceState` 清 query）
- **🟢-13** GET 带副作用：`announcement.controller.ts:28-32` `@Get(':id')` 读详情即标记已读——浏览器预取/爬虫/链接预览会"读"掉公告，部长看"谁看了"统计失真；应改 `POST :id/read` 显式已读
- **🟢-14** `core_users.email` 大小写敏感（schema 无 citext）：同一邮箱不同大小写可重复注册/登录失败；注册时应 `email.toLowerCase().trim()` 规范化
- **🟢-15** `bot.module.ts:12` `this.bot.ensure()` 未 await（fire-and-forget，首条 @bot 消息可能先于 bot 用户创建到达而丢失）；`dev-assistant.service.ts:81` bot 工具调用 ctx 无 `agentId`——未来给 bot 加写工具时将绕过审批分支，需一并补上

---

## 3. 四视角：亮点与问题

### 3.1 资深前端工程师视角

**亮点**
1. 插件化 UI 落地完整：`UiContribution` 契约 → `composeUi` 组合器（`web/ui/contribution.ts`）→ `manifest.ts` 注册表，菜单/路由/插槽全声明式，与后端能力包一一对应，新增能力包成本低
2. 主题 token 纪律优秀：语义色全部收敛到 `tokens.ts` + `main.css` 的 `--cs-*` 变量，46 个文件仅 2 处违反；`StatusBadge` 状态映射与 FRONTEND.md 规范逐字对齐
3. 全站零 `v-html`，UGC 内容全部插值渲染——内容注入型 XSS 在渲染层被根除
4. 列表页 loading/error/EmptyState+CTA 三态一致，v-for 全带 `:key`，数字 tabular-nums

**问题**
1. 缺 `n-message-provider` 导致 12 页崩溃（🔴-1）——基础设施缺失是最大失分项
2. 无路由守卫、无 401 拦截、无 token 续期（🔴-8），前端对"会话生命周期"完全没有治理
3. fetch 无统一封装：10+ 处无 `res.ok` 校验/无 catch，操作型请求失败也提示成功（`ApprovalsView.vue:33-39` 403 也弹"已批准"）
4. 拖拽看板是"看起来能用"（🟡-6）；对比度 `#fff on #58a6ff = 2.53:1` 不达标（FRONTEND.md 硬标准 4.5:1）
5. 路由级 code-splitting 缺失：仅 3 个根视图懒加载，14 个能力包视图静态导入进首屏主包

### 3.2 资深后端工程师视角

**亮点**
1. 全局守卫装配正确：`JwtAuthGuard → PermissionGuard`（`permissions.module.ts:12-20`）fail-closed，`@Public()` 显式声明，能力包控制器普遍挂了权限点
2. 令牌类凭据全部哈希落库：邀请 sha256、refresh sha256 + `replacedBy` 轮换链、OAuth client_secret sha256——"DB 泄露不能伪造邀请/token"设计兑现
3. 脱敏双视图（`users.service.ts:59-62` toPublic 彻底剥离姓名/区队/邮箱/角色）贯彻到所有工具输出（四只读工具均不返回 content/description/realName）
4. 项目级资源授权（`project.service.ts:195-199` 双条件校验）实现干净，e2e 有覆盖
5. 正确借用官方 MCP SDK：PKCE S256 强制、redirect_uri 注册比对、授权码一次性均由 SDK 保证

**问题**
1. 审计/审批/限额全部内存态（🔴-3、🟡-1）——"审计铁律"与"双限额"是进程级假象
2. 角色压平：MCP 与审批执行硬编码 `role:'member'`（🔴-5c）导致干部 agent 审批后执行失败
3. check-then-act 竞态三连：邀请名额、refresh 轮换（`auth.service.ts:60-75` 双并发可双签发）、OAuth code 使用（`oauth-server.provider.ts:102-108`）
4. 事件契约漂移（🟡-16）+ 事件监听器错误被 `@nestjs/event-emitter` 静默吞掉（如 `IdeaMatchService` 用 try/catch 包住，bot 订阅无错误隔离）
5. `POST /tools/:id/call` 人工调用一律 `skipApproval`（`tools.controller.ts:31`）——审批只对 agent 生效的设计可接受，但 `example.dangerous` 这类"无权限点+需审批"工具就是敞口

### 3.3 系统工程师视角（部署/架构/安全）

**亮点**
1. 生产凭证确实轮换且受控：容器 JWT_SECRET=64 字符随机、`~/.cyberswat-dev-prod.env` 权限 600、--env-file 注入、API/DB 均不暴露宿主端口（仅 127.0.0.1:8092），MCP 8094 仅容器内网
2. 备份 cron 已落地并验证：每日 03:00、30 天滚动、空文件校验、成功日志（今日手工运行产出有效 dump 1059 行）
3. 容器网络隔离干净：dev-api/dev-db 无宿主端口，nginx 单点反代 + CF Tunnel 回源 loopback
4. 迁移 SQL 质量合格：索引/外键/枚举声明齐全，无破坏性迁移；`prisma migrate deploy` 幂等入启动脚本
5. 构建策略规避了容器内 npm（宿主 build → COPY dist），绕开了 fake-ip 坑

**问题**
1. compose 与线上漂移 + web/api 无 restart（🟡-12）——"一键部署"脚本实际不可复现，且宕机不恢复
2. JWT_SECRET 兜底默认值（🔴-4）与弱口令 DATABASE_URL 硬编码并存于 compose
3. 认证/令牌端点零限速（🔴-9）；全栈无 helmet、无请求日志/结构化日志（`oauth-server.provider.ts:173` 每次 verify 打 info 刷屏）
4. 无 healthcheck（三容器全无，`Dockerfile.api:17` migrate+start 与 DB 就绪存在竞态）、无 .dockerignore、镜像无 tag
5. GitHub access token 明文入库（🔴-10c）+ 备份文件 664 含 PII——两条凭据/PII 静置路径

### 3.4 产品经理视角

**亮点**
1. R1 主链路实质达成：资料（两级词表+自定义兜底+匹配开关）→ 点子 → 匹配（≤3 条/天+幂等排除）→ 通知，设计文档承诺的核心闭环可用
2. R2 骨架完整且上线有真实调用：MCP 端点/OAuth2.1+DCR/双限额/审批工作台/bot @触发/三客户端实测声明，部门 agent 路线图的底座已就位
3. 隐私红线贯彻度高：PublicUserProfile 无 realName/teamInfo/email，各列表/工具输出仅昵称，agent 数据面脱敏
4. 产品边界纪律好："明确不做"清单（运行时插件/消息队列/微前端/内容自动审核）守住了 scope

**问题**
1. 授权确认页（DESIGN #9）、冻结级联（#8）、authorViaAgent（#11）、审计聚合视图（#5）、content.* 事件（#13）等 6+ 项 DoD 级承诺未兑现——R2 是"机制在、体验与安全闭环缺"
2. 关键用户路径有断点：匹配通知不实时不跳转（🟡-8/9）、bot 回复不通知发起人（🟡-10）、审批请求不通知部长（🟡-4）、/agent 授权入口死链（🟡-3）
3. 18 项规划功能遗漏：招新页、成员主页项目经历、通知分组/单条已读、仪表盘活动流、ListSkeleton/ConfirmAction 通用组件、引用回复、词表加词治理等
4. 仪表盘数据失真（🟡-7）会直接误导部长决策；菜单无角色过滤让普通成员反复撞 403
5. 生产测试账号弱密码写进公开文档（🟡-13）——产品治理层面的后门

---

## 4. 测试覆盖评估（e2e.spec.ts，9 用例 vs DESIGN #18 承诺 ~30）

**已覆盖**：邀请注册基础流、登录→me、member 越权发公告 403、HTTP 工具直调、项目级权限（LEAD/普通成员）、匹配通知基本流、举报→处置→软删除、词表+PATCH /me。

**盲区（9 类）**
1. **R2 全链路 0 覆盖**：OAuth 2.1（DCR 注册/PKCE 失败/authorize/token/refresh 轮换/revoke）、MCP tools/list+call、双限额、scope 过滤、级联撤销、bot @触发——全部无测试
2. **审批流程假阳性**：用例"agent 调用 requiresApproval → pending 队列"（:109-125）实际断言的是 HTTP `skipApproval` 直通成功（:121-122 注释自述），**pending→approve→执行 真路径从未被测试**，且该路径正是 🔴-5c 的执行失败 bug
3. 匹配边界：≤3 条/天上限、allowMatch=false、发布人/已加入者排除、无技能不通知——0 覆盖
4. refresh token 轮换/重放、邀请撤销/过期/名额耗尽（含并发）、GitHub OAuth——0 覆盖
5. 通知已读/未读计数/单条已读、公告已读追踪与重要确认——0 覆盖
6. 任务闭环只测创建：claim/submit/review 通过/驳回、非指派人提交拒绝——0 覆盖
7. **脱敏断言 0 覆盖**：从未断言 PublicUserProfile 不含 realName/teamInfo/email
8. **越权矩阵 0 覆盖**：member 访问 /tools/audit、/tools/pending、/announcements/:id/readers（后两个缺陷真实存在）
9. 前端零测试；e2e 无测试库强制隔离（🟡-14），且测试中把 member 提升 DEPT_LEADER 后不还原（角色漂移污染后续用例）

---

## 5. 优先级建议（Top 5，按影响/成本排序）

| 序 | 事项 | 对应问题 | 理由 | 预估成本 |
|---|---|---|---|---|
| 1 | 前端基建修复：加 `n-message-provider` + 统一 fetch（401 拦截/refresh 续期/user 持久化/启动拉 /me） | 🔴-1、🔴-8、🟡-8 | 一处基础设施恢复 12 个崩溃页面 + 修复 15 分钟强制登出与身份丢失，单次改动收益最大 | 0.5~1d |
| 2 | 审计/审批落库 `core_tool_calls` + `/tools/audit`、`/tools/pending` 加 `@Authorize('audit.view')` | 🔴-3 | 公安院校审计红线与数据泄露敞口，合规刚需 | 0.5d |
| 3 | GitHub OAuth 修复：关闭自动建号（转邀请/审核）+ 加 state + token 改 fragment + githubToken 加密 | 🔴-2、🔴-10 | 邀请制成员边界被击穿 + 登录 CSRF + 凭据明文，三合一安全事件 | 0.5~1d |
| 4 | JWT_SECRET 去默认回退：启动硬校验 + compose `${JWT_SECRET:?}` + 4 处代码兜底移除 | 🔴-4、🔴-9 | 认证体系最后一道保险，顺带补登录限速 | 0.5d |
| 5 | OAuth 授权链：授权确认页 + scope ⊆ owner 权限校验 + refresh scope 子集限制 + 按 owner 角色执行审批 + 冻结级联撤销 API | 🔴-5、🔴-6 | R2 核心承诺的三处 DoD 缺口，直接决定 agent 体系可用性与"agent 权限=主人权限"语义 | 2~3d |

**次要排期建议**：🟡-12（compose 对齐 + restart 策略，半天，防宕站）→ 🟡-6/7（看板拖拽与仪表盘数据，体验高感知）→ 🟡-4/10（审批通知联动与 bot 回复通知，闭环补全）→ 🟢 批量清理（索引/安全头/清理任务/example 剔除）。

---

## 附：评审方法与事实核验说明

- 阅读范围：`apps/api/src` 全部 68 个 TS 文件、`apps/web/src` 全部 46 个文件、`packages/shared` 契约、`schema.prisma` + 全部 8 个迁移 SQL、docker-compose/Dockerfile×2/nginx/build.sh、e2e.spec.ts、DESIGN/FRONTEND/ITERATION-R1/R2/VISION/PRD/AGENTS/README 全量文档
- 事实核验：对 naive-ui@2.44.1 源码（use-message 抛错行为）、MCP SDK authorize/token 处理器（PKCE 强制、redirect_uri 比对、scope 无注册比对）做了源码级确认；对本机线上容器做了 docker inspect 网络/重启策略/健康检查、生产库行数（core_tool_calls=0、githubToken 非空、测试账号存在）、备份脚本与 crontab 实测
- 结论分级：🔴 = 安全/数据/核心功能失效或明显违反设计红线；🟡 = 健壮性/体验/规范缺失；🟢 = 可延后优化
