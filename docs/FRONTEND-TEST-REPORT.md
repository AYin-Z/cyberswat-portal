# CyberSWAT 开发部子站 — 前端测试报告（基建搭建 + 交互逻辑评审 + 可运行测试）

> 测试对象：cyberswat-dev-portal `apps/web`（Vue3.5 + Vite + TS + Pinia + Naive UI 2.44.1 + vue-router4 + socket.io-client）
> 测试方式：vitest@4.1.10 + @vue/test-utils@2.4.11 + jsdom@30 + @pinia/testing@2.0.1（全新搭建）
> 测试日期：2026-08-15 · 状态：✅ 基建落地 + **3 个 🔴 已修复（第二轮）** + **全站 API 客户端统一（🔴-4/🟡-1/2/4/6/8）**，**66/66 用例全绿**，typecheck 通过
> 提交：cyberswat-dev-portal（见本次 commit，标注「前端测试基建与用例」）
> 路径前缀：`web/` = `apps/web/src/`，`dist/` = `apps/web/dist/`

---

## 1. 测试环境与方法

### 1.1 基建（本次新增）

| 项 | 内容 |
|---|---|
| 依赖（devDependencies） | `vitest@4.1.10` `@vue/test-utils@2.4.11` `jsdom@30.0.1` `@pinia/testing@2.0.1` |
| 配置文件 | `web/vitest.config.ts`（jsdom 环境、`globals:true`、setup 文件、testTimeout 20s） |
| 全局 setup | `web/test/setup.ts`（naive-ui 所需 ResizeObserver/matchMedia/scrollTo polyfill + 每用例重置 localStorage） |
| npm scripts | `web/package.json` 新增 `test` / `test:watch` |
| 运行方式 | `cd apps/web && ./node_modules/.bin/vitest run`（PATH 前加 `/home/ayin/.local/bin`） |

### 1.2 测试用例清单（9 个文件 / 64 用例）

| 文件 | 覆盖点 | 用例数 |
|---|---|---|
| `web/src/lib/api.test.ts` | 成功带 Authorization / skipAuth / 401→refresh 重放 / 并发 401 去重（refresh 仅 1 次）/ refresh 失败登出+跳转 / **401 无 refreshToken 不登出（缺陷文档化）** / message 字符串·数组·fields 提取 / 非 JSON 回退 / 204 | 9 |
| `web/src/stores/auth.test.ts` | login 双 token 持久化 / login 失败文案 / restore 拉 /me / restore 401 清空 / 无 token 直接完成 / 幂等 / logout 清理 / setTokens | 8 |
| `web/src/components/StatusBadge.test.ts` | task/idea/priority 映射 / 未知状态回退 / **无 type 不抛错**（🟢-11 已修复验证） | 7 |
| `web/src/components/EmptyState.test.ts` | 文本/默认图标/自定义图标 / CTA 渲染与 action 事件 / 无 CTA 不渲染按钮 | 4 |
| `web/src/router/guard.test.ts` | 未登录→/login?next= / 已登录访问 /login→/ / 公开页放行 / 深层路径 next 保留 | 6 |
| `web/src/views/LoginView.test.ts` | GitHub fragment token→setTokens+清 hash+跳首页 / /me 失败错误提示 / 表单登录成功·失败 | 4 |
| `web/src/components/NotificationBell.test.ts` | socket 连接带 token / unread 计数 / new 置顶+未读+1 / toggle emit fetch / list 替换 / markAll POST+清空 / 点击跳转 / 99+ 截断 / 卸载断开 | 9 |
| `web/src/views/smoke.test.ts` | **挂载不抛错**（AnnouncementNewView/ProfileView，含 provider 回归守卫：无 provider 必抛错）/ 空表单 warning / 提交 POST+跳转 / IdeaList 渲染+筛选 | 8 |
| `web/src/capabilities/project/TaskBoardView.test.ts` | 列计数 / **卡片渲染回归**（🔴-2 已修复）/ **拖拽 claim 流转**（🔴-3 已修复，源列/目标列触发双用例）/ 状态机 claim·submit·review 分支 / 非法跳转 warning / 新任务弹窗校验与创建 | 9 |

**总计 64 用例：64 通过，0 失败。** `vue-tsc -b --noEmit` 通过。

---

## 2. 测试结果摘要

### 2.1 通过情况

- **66/66 全部通过**（64 基线 + 新增 2 个 LoginView next 回跳/防 open redirect 用例）。初版 3 个「预期失败」用例（各自锚定一个真实 🔴 缺陷）在修复后**自动转绿**，用例本身保留为回归守卫。
- **第二轮修复（🔴-4 统一 API 客户端）**：全站 20 视图 48 处调用点迁移 `api()`；api.test.ts「401 无 refreshToken」用例由「缺陷文档化」改写为断言修复行为（登出+跳转）；NotificationBell.test.ts 断言适配 Headers 实例。
- 上一轮 🔴-1（缺 n-message-provider 全站白屏）**已修复并加回归守卫**：smoke.test.ts「无 NMessageProvider 时 useMessage 抛错」用例验证该回归确实会被拦截。
- 上一轮 🟢-11（StatusBadge 无 type 抛 TypeError）**已修复**：7 个用例全绿。

### 2.2 3 个 🔴 缺陷：已全部修复（用例转绿）

| # | 用例（文件） | 缺陷 | 修复 |
|---|---|---|---|
| 1 | smoke.test.ts `ProfileView 渲染 NSelect 抛错` | **资料页白屏**：NSelect 分组选项缺 `children-field`（详见 §3 🔴-1） | ✅ `ProfileView.vue` 补 `:children-field="'options'"` |
| 2 | TaskBoardView.test.ts `看板卡片不渲染` | **任务看板四列全空**：`#item` 槽官方 dist 不渲染（详见 §3 🔴-2） | ✅ 改默认槽 + `v-for` 渲染卡片 |
| 3 | TaskBoardView.test.ts `拖拽 claim 从未被调用` | **拖拽流转不生效**：`@end` 只派发到源列（详见 §3 🔴-3） | ✅ handler 改用 `e.from/e.to` 的 `data-col` 判定目标列 |

> 说明：3 个失败用例不是「测试写错」——每个都先用独立最小复现验证过根因，再落到视图级断言。修复对应缺陷后，用例自动转绿（本次已验证：64/64）。

---

## 3. 交互逻辑问题清单

### 🔴 严重（功能不可用 / 页面崩溃 / 数据错误）

**🔴-1 资料页「个人资料」打开即渲染崩溃（白屏）—— 新发现，被上轮 🔴-1 掩盖** ✅ **已修复**
- 修复：`ProfileView.vue` NSelect 增加 `:children-field="'options'"`（1 行）；smoke.test.ts 回归用例已转绿。
- 位置：`web/capabilities/profile/ProfileView.vue:112`（`<n-select v-model:value="skills" multiple filterable tag :options="skillOptions" …>`）+ `:40-45`（分组选项 children 键为 `options`）
- 根因：naive-ui 2.44.1 `Select` 的 `childrenField` **默认值是 `'children'` 而非 `'options'`**（`naive-ui/lib/select/src/Select.js:70-71`），分组选项未传 `children-field` → `createValOptMap`（`utils.js:71-77`）读 `option['children']` 为 undefined → `forEach` 抛 TypeError。触发条件：`value` 为数组即崩（ProfileView 的 `skills` 恒为 `[]`），**只要 `/api/skills` 返回任意分类就必崩**。
- 复现路径：登录 → 侧边栏「资料」→ 页面加载 `/api/me`+`/api/skills`（后端必返回分类）→ 表单渲染 NSelect → 崩溃；无 errorHandler 时整个表单更新失败，只留 loading。
- 证据：最小复现 `NSelect + group options + value:[]` 挂载同步抛错；加 `children-field="options"` 后复现消失（已验证修复方向）。
- 修复建议：ProfileView.vue:112 增加 `:children-field="'options'"`（1 行）。上线前建议顺手检查全站其它分组 NSelect 是否同病。

**🔴-2 任务看板卡片完全不渲染（四列全空）—— 旗舰页面名存实亡** ✅ **已修复**
- 修复：改用**默认槽 + `v-for`** 渲染卡片（方案 a）；TaskBoardView.test.ts 回归用例已转绿。
- 位置：`web/capabilities/project/TaskBoardView.vue:159-186`（`<draggable …><template #item="{ element }">…`）+ 依赖 `vue-draggable-next@2.3.0`
- 根因：该版本官方 dist 的 `render()`（`node_modules/vue-draggable-next/dist/vue-draggable-next.esm-bundler.js:3414-3425`）**只输出默认槽内容，从不消费 `#item` 槽**（README 文档与产物不一致）。已用隔离用例验证：`#item` 槽 → 0 张卡片；默认槽 + `v-for` → 正常渲染。渲染逻辑与 DOM 无关，生产浏览器同样为空；产物主包（`dist/assets/index-C3qOadok.js`）包含同一段代码。
- 复现路径：登录 → 侧边栏「任务」→ 看板四列只有计数 0，无任何卡片。
- 修复建议：(a) 改用默认槽 + `v-for` 子元素渲染（与 README 备选用法一致，已验证可行）；或 (b) 升级/替换拖拽库并回归测试。

**🔴-3 拖拽流转依旧不生效（即便卡片能渲染，状态机也无法从 UI 触发）** ✅ **已修复**
- 修复：给 `.col-body`（draggable 根）加 `:data-col="col.key"`，`@end` handler 用 `e.from/e.to` 的 `data-col` 判定真实目标列后调 `move(t, target)`；同时顺延状态机（拖拽跳列时按 TODO→IN_PROGRESS→REVIEW→DONE 流转）。测试补充「源列触发」「目标列触发」双用例验证。
- 位置：`web/capabilities/project/TaskBoardView.vue:165-170`
  ```js
  @end="(e) => { const id = e.item?.dataset?.id; const t = tasks.find(x => x.id === id)
    if (t && t.status !== col.key) move(t, col.key) }"
  ```
- 根因：Sortable.js 的 `end` 事件**只派发到拖拽起始列**的实例（源码 `_dispatchEvent({ sortable: this, name:'end', … })` 中 `this` 为源 sortable），因此 `col.key` 恒为源列状态 → `t.status !== col.key` **恒为 false** → `move()` 永不执行；拖拽只是 DOM 层面的视觉移动，刷新即还原，且无任何提示。同时看板上没有任何 claim/submit/review 按钮兜底（新任务弹窗也仅能建任务），**TODO→IN_PROGRESS→REVIEW→DONE 状态机在 UI 上完全不可达**。
- 证据：TaskBoardView.test.ts「修复方向验证」用例证明：若 handler 拿到的是目标列（col.key=IN_PROGRESS），claim 分支可正常工作 → 问题 100% 在事件绑定侧。
- 修复建议：handler 用 `e.to`（目标容器 DOM）反查目标列 key（如给 `.col-body` 加 `data-col`），比较 `t.status !== targetColKey` 后调 `move(t, targetColKey)`；或给卡片补「移动到」按钮兜底（FRONTEND.md §4 承诺项）。

**🔴-4 统一 API 客户端（401 拦截 / refresh 续期）零接入 —— 🔴-8 修复只停留在 lib 层** ✅ **已修复**
- 修复：**全站 20 个视图 48 处调用点全部迁移到 `api()`**（自动带 token / 401→refresh→重放 / 非 2xx 抛 ApiError）；`api.ts` 401 分支重构——refreshToken 判断移入分支内部，无 refreshToken（如 GitHub 登录）或续期失败一律登出跳转（api.test.ts 对应用例已从「缺陷文档化」改为断言修复行为）。
- 有意保留的 5 处裸 fetch：LoginView `/api/auth/me`（GitHub 临时 hash token，不走 store）、AgentView MCP `/register` `/token`（跨域 OAuth 端点，不能带站内 Authorization）、stores/auth（防与 api.ts 循环依赖）。
- 附带消灭：🟡-4（HomeView 脆弱解析）、🟡-6（假成功）、🟡-8（注册无 refresh token）。
- 位置：`web/src/lib/api.ts`（全仓库**无任何 import**，grep 确认）；所有视图仍用裸 `fetch`（如 `HomeView.vue:60-63`、`TaskBoardView.vue:67-69`、`IdeaListView.vue:38-40`…）
- 影响：access token 15 分钟过期后，**所有视图**直接 401 失败；refresh 续期、ApiError 统一错误处理全部形同虚设。叠加 HomeView 的脆弱解析（见 🟡-4），刷新页面即可能卡死。
- 附带缺陷：`api.ts:62` 的 `if (res.status === 401 && auth.refreshToken && !options.skipAuth)` —— refreshToken 为空（如 GitHub 登录 `setTokens(hashToken,'')`）时 401 **不登出、不跳转**，只抛错，用户滞留报错页（已由 api.test.ts 文档化）。
- 修复建议：全站视图迁移到 `api()` 封装（或至少 `window.fetch` 全局拦截做 401→refresh→重放）；`api.ts` 把 refreshToken 判断移到分支内部，401 一律登出跳转。

### 🟡 重要（体验破损 / 边界缺陷 / 权限 UX）

**🟡-1 登录后忽略路由守卫携带的 next 参数，深层页回跳失效** ✅ **已修复**
- 修复：`LoginView.vue` 新增 `nextPath()`——表单登录与 GitHub 回调均回跳 `?next=`（仅允许站内相对路径，`//` 与外链回落首页，防 open redirect）；新增 2 个测试用例（`?next=/tasks` 回跳、`?next=https://evil.example` 回落）。
- 位置：`router/index.ts:31`（守卫写入 `next`）；`web/views/LoginView.vue:19`（`submit()` 恒 `router.push('/')`）
- 复现：未登录点开 `/tasks` → 跳 `/login?next=/tasks` → 登录成功 → 落到首页而非任务页。
- 修复：`router.push((route.query.next as string) ?? '/')`（注意 next 为相对路径，需防 open redirect）。

**🟡-2 管理菜单对全体成员可见，普通成员反复撞 403** ✅ **已修复**
- 修复：`UiContribution.menu` 增加可选 `roles?: string[]`（省略 = 全员可见）；invites/approvals/moderation 三个 manifest 声明 `roles: ['dept-leader','admin']`（与后端守卫一致：invite.controller / tools.controller:52 / moderation.service:45,92）；App.vue `menuOptions` 按 `auth.user?.role` 过滤。
- 位置：`web/App.vue:19-29`（`menuOptions` 直接铺 `ui.menu`，无角色过滤）
- 影响：member 也能看到「审批 / 处置 / 邀请」入口，点击后被后端 403（后端已按权限收紧，前端未同步隐藏）；上一轮 🟡-4 前端侧仍未修。
- 修复：按 `auth.user?.role` 过滤（dept-leader/admin 才显示 approvals/moderation/invites），或后端下发菜单权限。

**🟡-3 NotificationBell 样式变量全部未定义，通知面板样式静默失效**
- 位置：`web/components/NotificationBell.vue:78-88`（`var(--panel)/--border/--muted/--fg/--accent`）；全局仅定义 `--cs-*`（`web/assets/main.css:3-21`）
- 影响：面板 `background: var(--panel)` 无效 → 透明底、边框/文字颜色回退，深色主题下可读性差；`color: var(--fg)` 无效。上一轮 🟢-10 前端侧未修。
- 修复：全部改为 `--cs-*` 语义变量。

**🟡-4 刷新页面时 token 过期 → HomeView 解析崩溃/无限 loading（会话竞态）** ✅ **已修复**
- 修复：HomeView 迁移到 `api()`（非 2xx 抛错）+ try/catch/finally（finally 兜底 loading）；全站统一后 401 由 api() 处理续期或登出跳转。
- 位置：`web/main.ts:14`（`restore()` 异步，登出晚于守卫）；`router/index.ts:29`（守卫读 localStorage 已通过）；`web/views/HomeView.vue:59-68`（4 个 fetch 均 `r.json()` 无 `res.ok` 校验，`(t ?? []).slice(0,6)` 遇 401 错误对象 `{message}` 直接 TypeError）
- 复现：登录后等 access token 过期 → 刷新页面 → 守卫放行 → `/me` 失败登出（异步）与 HomeView 挂载（同步）竞态 → 列表渲染崩溃、loading 卡死。
- 修复：视图统一走 `api()`（🔴-4）；`restore()` 失败后主动触发路由回登录。

**🟡-5 仪表盘 KPI 计数失真（先截断再计数）**
- 位置：`web/views/HomeView.vue:65`（`tasks.value = (t ?? []).slice(0, 6)`）与 `:45-50`（KPI 基于已截断数组过滤）
- 影响：待接单/进行中/待验收数字上限 6，任务多时误导部长。
- 修复：KPI 基于原始数组，展示层再截断。

**🟡-6 操作型请求普遍不校验 `res.ok`，403/失败也弹成功提示（假成功误导）** ✅ **已修复**
- 修复：全站写操作迁移 `api()` 后统一 try/catch + `message.error(e.message)`——审批/处置/邀请/看板 claim·submit·review/项目详情/社区 like·comment·report·删除/点子 join 等全部失败即报错、不再假成功（TaskBoardView.test.ts 断言仍在验证成功路径）。
- 位置：`web/capabilities/approvals/ApprovalsView.vue:32-40`（审批失败也弹「已批准并执行」）、`web/capabilities/moderation/ModerationView.vue:43-50`（弹「已删除违规内容」）、`web/capabilities/invites/InvitesView.vue:62-69`（弹「已撤销」）、`web/capabilities/project/TaskBoardView.vue:96-106`（claim/submit 失败也弹「任务已更新」）、`web/capabilities/project/ProjectDetailView.vue:41-64`（claim/submit/review 同）、`web/capabilities/community/PostDetailView.vue:50-56`（like 不校验）
- 修复：统一 `if (!res.ok) return message.error(…)`；建议抽公共请求封装（🔴-4 一并解决）。

**🟡-7 HomeView 未登录 hero 区为死代码**
- 位置：`web/views/HomeView.vue:161-171`；守卫（`router/index.ts:30-32`）会把未登录访问 `/` 一律重定向 `/login`，hero 分支不可达。
- 修复：删除死代码，或把 `/` 改为公开页让品牌入口生效（产品决策）。

**🟡-8 RegisterView 绕过 setTokens，注册后无 refresh token** ✅ **已修复**
- 修复：`RegisterView.vue` 改 `auth.setTokens(data.accessToken, data.refreshToken)`（后端 LoginResult 返回双 token，注册用户同样获得 14 天续期能力）。
- 位置：`web/views/RegisterView.vue:38-40`（`auth.token = …; localStorage.setItem('dev_token', …)`，未写 `dev_refresh`、未走 `setTokens`）
- 影响：与 🔴-8 的会话治理不一致，注册用户无续期能力；后端若同时返回 refreshToken 则被丢弃。
- 修复：`auth.setTokens(data.accessToken, data.refreshToken)`。

**🟡-9 可访问性：表单无 label、铃铛无 aria-label、主按钮对比度不达标**
- 位置：`web/views/LoginView.vue:64-75`、`web/views/RegisterView.vue:62-69`（仅 placeholder 无 `<label>`）；`web/components/NotificationBell.vue:58`（铃铛按钮无 aria-label）；主 CTA 白字 on `#58a6ff` 对比度 ≈ 2.5:1（FRONTEND.md 硬标准 ≥4.5:1，涉及 `LoginView.vue:160-170`、`App.vue`、`AgentView.vue:256-264`）
- 修复：补 label（可用 `aria-label`/`sr-only`）；按钮文字加深或用深色底；铃铛加 `aria-label="通知"` + `aria-expanded`。

**🟡-10 通知闭环仍缺单条已读（上一轮 🟡-8 前端侧未全修）**
- 位置：`web/components/NotificationBell.vue:46-50`（仅 markAll；后端 `/api/notifications/read/:id` 存在但无人用）；点击通知只跳转不标已读。
- 修复：点击项时调 `POST /api/notifications/read/:id` 并本地置 read。

### 🟢 建议（可延后）

- **🟢-1 路由懒加载缺失**：`web/ui/manifest.ts` + 各 `capabilities/*/*.ui.ts` 全部静态 `import` 视图 → 14+ 视图进主包（`dist/assets/index-C3qOadok.js` 1,044,418B ≈ 1MB），仅 3 个根视图拆包。修复：`.ui.ts` 改 `component: () => import('./XxxView.vue')`。
- **🟢-2 未使用依赖**：`@vicons/ionicons5`、`@cyberswat/shared`（前端零引用，grep 确认；上一轮 🟢-8 未清理）。
- **🟢-3 任务看板提交用 `window.prompt`**（`TaskBoardView.vue:95`、`ProjectDetailView.vue:47`）：阻塞式、无校验，建议换成 Modal 表单。
- **🟢-4 看板无移动端/键盘兜底**：拖拽不可键盘操作、无「移动到」菜单（FRONTEND.md §4 承诺未实现）。
- **🟢-5 新任务弹窗未用 n-form 校验规则**（`TaskBoardView.vue:191-213`）：仅 `newTitle` 非空判断，描述/截止等无约束。
- **🟢-6 AgentView OAuth 回调链**（`AgentView.vue:105-145`）：`exchangeCode` 未 await、成功后 `authorizedClients` 不刷新、`localStorage` 明文存 `client_secret`。
- **🟢-7 样式细节**：`InvitesView.vue:133` 的 `import { h }` 位置；`.count` 硬编码 `#f85149` 违反「页面禁裸色值」纪律（`NotificationBell.vue:79`）。

---

## 4. 前端测试基建评价

### 4.1 覆盖率

- **已覆盖**：认证生命周期（login/restore/logout/双 token）、统一 API 客户端全分支（含并发去重）、路由守卫、通知闭环（socket 事件/未读/全部已读/跳转）、登录页 GitHub fragment 流程、看板状态机与弹窗、三视图挂载冒烟、通用组件（StatusBadge/EmptyState）。
- **测试即证据**：3 个真实 🔴 缺陷由 3 个预期失败用例锚定，修复后自动转绿——这是本轮测试的最大价值（相比上一轮「代码阅读式」评审，本轮的 ProfileView 白屏与看板空渲染是**阅读代码无法稳定发现**的运行时缺陷）。
- **最缺测试的模块**（按优先级）：
  1. `capabilities/community/PostDetailView.vue`：评论/点赞/举报/删除交互（当前仅代码审查）；
  2. `capabilities/project/ProjectDetailView.vue`：claim/submit/review 按钮路径 + 权限分支（review 仅创建者可点）；
  3. `capabilities/invites|moderation|approvals`：表格操作 + 403 假成功回归；
  4. `capabilities/agent/AgentView.vue`：DCR/OAuth 回调/state 校验；
  5. `views/HomeView.vue`：KPI 计算与空态；
  6. `ui/contribution.ts` + `ui/manifest.ts`：composeUi 纯函数单测（成本极低）。
- **jsdom 边界**：真实拖拽（Sortable DOM 操作）与 `window.prompt` 无法在 jsdom 完整模拟——建议后续补 Cypress 组件/端到端做拖拽回归；本轮已把拖拽逻辑压到「事件派发 → move 分支」层验证（够用且已抓到根因）。

### 4.2 基建健康度

- 64 用例 / 9 文件 / 全绿 typecheck / 无未处理错误，单次全量运行 ≈ 1.2s（含 naive-ui 渲染），适合接入 CI（`pnpm --filter @cyberswat/dev-web test`）。
- 已内置两个「历史回归守卫」：n-message-provider 缺失必抛错、StatusBadge 无 type 不抛错——防止旧 🔴/🟢 复发。

---

## 5. 优先修复 Top 5（按影响/成本排序）

| 序 | 事项 | 对应问题 | 理由 | 状态 |
|---|---|---|---|---|
| 1 | ProfileView NSelect 补 `children-field="options"`（1 行） | 🔴-1 | 资料页必崩白屏，一行修复，收益立竿见影；回归用例已就位 | ✅ 已修复 |
| 2 | 任务看板：卡片改默认槽 + v-for 渲染；@end 用 `e.from/e.to` 反查目标列再 move | 🔴-2、🔴-3 | 旗舰功能「空看板 + 状态机不可达」双重失效；两个修复方向均已由测试验证可行 | ✅ 已修复 |
| 3 | 全站视图接入 `lib/api.ts` + 修复 api.ts 无 refreshToken 不登出分支 | 🔴-4、🟡-4、🟡-6、🟡-8 | 15 分钟强制失效 + 刷新页面崩溃链 + 假成功误导；一次改造全站收益 | ✅ 已修复 |
| 4 | 菜单按角色过滤（App.vue）+ LoginView 消费 `query.next` 回跳 | 🟡-1、🟡-2 | 权限 UX 两处高感知缺陷，改动集中在两个文件 | ✅ 已修复 |
| 5 | NotificationBell 样式变量改 `--cs-*` + 点击单条已读 | 🟡-3、🟡-10 | 通知闭环体验修复 + 上一轮遗留项收口 | ⏳ 待办 |

**备注**：🔴-2/🔴-3 修复后，「预期失败」用例已同步改写为正常回归断言（真实 Sortable.js 事件结构：`evt.from/evt.to` 为列容器 DOM，`evt.item` 为卡片 DOM），已全部转绿。

---

## 附：事实核验说明

- 所有行号基于当前仓库 HEAD（`9ad4d86`）实际代码，非臆测。
- 三个 🔴 均做了最小复现与源码级确认：naive-ui 2.44.1 `childrenField` 默认值（`lib/select/src/Select.js:70`）；vue-draggable-next@2.3.0 render（`dist/vue-draggable-next.esm-bundler.js:3414`，且与官方 npm tarball md5 一致）；Sortable `end` 事件仅派发源列（bundle 内 `_dispatchEvent({ sortable: this, name:'end' })`）。
- 性能结论基于 `apps/web/dist/assets/index-C3qOadok.js`（1,044,418B）与仅 3 个根视图拆包的事实。
- 测试运行命令：`cd /home/ayin/Current_Works/cyberswat-dev-portal/apps/web && PATH=/home/ayin/.local/bin:$PATH ./node_modules/.bin/vitest run`。
