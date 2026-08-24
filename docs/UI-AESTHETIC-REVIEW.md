# CyberSWAT 开发部子站 — 审美评估 + 交互逻辑优化评审

> 评审对象：dev.cyberswat.cn（dark-saas 深色科技风，Linear 式）
> 证据源：生产同源镜像 `127.0.0.1:8092` 真机截图（已登录 leader 账号）+ 源码 `cyberswat-dev-portal/apps/web/src`
> 代码基线：`7dbdfd1`（feat: 移动端适配 Top 10 全修）
> 评审视角：资深前端设计 + 交互设计，与前三轮（功能 / UI 设计 / 移动端）评审互补，不重复已修事项（token 变量、按钮对比度、断点、触控目标等）

---

## 综合评分

| 维度 | 分数 | 一句话 |
|---|---|---|
| **审美** | **80 / 100** | dark-saas 骨架与语义色体系扎实，主要失分在「图标体系割裂（emoji/SVG/文本字形混用）」与「个别页面布局留白失衡、标签文案未打磨」。 |
| **逻辑优化** | **74 / 100** | 交互闭环大体可用，但存在「同一屏未读计数互相矛盾」「启动 restore 竞态导致首页数据错位」「审批页双空态重复」「技能双入口冗余」等实质问题。 |

**总评**：整体已是「能看的专业后台」，但离「让人一眼舒服的精致工具」还差一批细节 —— 审美上限被图标风格不统一和几处对齐/文案粗糙拖住，体验下限被「计数不一致 + 刷新竞态」这类状态流问题拉低。**优先补状态流一致性，其次做图标与布局的统一样式。**

---

## 一、审美问题清单

> 分级：🔴 明显丑/不协调（影响第一印象）｜🟡 一般（可感知的不完美）｜🟢 打磨（锦上添花）

### A1. 🔴 图标体系割裂：SVG 线性图标 ↔ emoji ↔ 文本字形「三套并存」

**截图证据**：`agent.png` 顶栏铃铛是彩色 emoji 🔔（红点 4），`ideas.png` / `home.png` 点子 need 前缀是 🔧，`posts.png` 帖子 meta 是 💬 👍，`tasks.png` 卡片提交说明是 📎；而左侧栏是干净的 ionicons5 线性 SVG（首页/公告/任务…）。同一屏里「矢量线条 — 彩色 emoji — 灰阶文本字形」三代图标混用。

**代码位置**：
- 侧栏 SVG：`apps/web/src/App.vue:12-22`（`@vicons/ionicons5` 映射）
- 🔔 emoji：`components/NotificationBell.vue:76`
- 🔧：`views/HomeView.vue:137`、`capabilities/idea-wall/IdeaListView.vue:77`
- 💬 👍：`capabilities/community/PostListView.vue:84`
- 📎：`capabilities/project/TaskBoardView.vue:250`
- ⬡ 文本字形：`App.vue:116`（品牌 logo）、`components/EmptyState.vue:15`（空态图标）、`views/LoginView.vue:63`

**设计依据**：dark-saas 规范「单一强调色 + 克制的几何美」，图标应统一为同族线性或同一套语义 SVG；emoji 会引入多色彩（🔔黄/🔧灰/💬灰/👍蓝）破坏「一个强调色」的纪律，也拉低质感。`AGENTS.md` 明确「⚡ 占位符/文本字形已清除」，但品牌 logo 与空态仍残留 ⬡。

**修复建议**：全站统一为一套线性图标（推荐继续用 ionicons5，或引入 lucide `@lucide/vue`）。把 🔔→`NotificationsOutline`、🔧→`HammerOutline`、💬→`ChatbubbleOutline`、👍→`ThumbsUpOutline`、📎→`AttachOutline`、⬡→`HexagonOutline` 全部替换为 SVG 组件；品牌 logo 与空态图标一并改用 SVG。估算改动集中在 5~6 个文件、约 12 处，收益最大。

### A2. 🟡 个人资料表单不居中，右侧留出近一半空区

**截图证据**：`profile.png` 表单卡片贴着内容区左缘，宽度约 640px，而内容区约 1200px，右侧悬浮约 500px 空暗区，视觉「头重脚轻、没对齐」。

**代码位置**：`capabilities/profile/ProfileView.vue:165-167`（`.wrap { max-width: 640px }`，无 `margin: 0 auto`）。

**设计依据**：窄表单卡在宽画布上应居中（登录页那样），或与内容区栅格对齐；贴左悬浮会造成「一半页面空着」的失衡。

**修复建议**：`.wrap { max-width: 640px; margin: 0 auto; }`（若想保持左对齐则把表单宽度升级到与栅格一致的 max-width，或改用 2 列栅格放「技能/外链」以填充右半区）。

### A3. 🟡 成员页「未设置年级」被当成一个正式年级分组，且显示「未知年级级」

**截图证据**：`members.png` 顶部出现一个深色分组标题「未知年级」（四位成员：开发部助理/Ayin/小林/部长 全部归入），看起来像「信息没填完」的半成品；同时 `部长` 卡片只有一个头像+昵称，完全无 bio/技能/外链，特别空。

**代码位置**：
- 空年级兜底为分组 key：`capabilities/members/MembersView.vue:36`（`const key = m.grade || '未知年级'`）
- 分组标题拼接：`MembersView.vue:56`（`{{ grade }}级`）→ 当 grade 为空时标题渲染为 **「未知年级级」**（代码事实，截图显示「未知年级」系生产容器为旧构建或字号过小未显「级」，两层都该修）
- 卡片空：`MembersView.vue:58-69`（无 bio/skills/links 时整卡只剩头像+昵称）

**设计依据**：「未知年级」是数据兜底文案，不应作为正式的强视觉分组标题出现；分组应在「该分组为空」或「全部未填」时降级为无标题或弱提示，避免给用户「残缺」观感。

**修复建议**：① 年级拼接改为 `m.grade ? \`${m.grade}级\` : '未设置年级'`，杜绝「未知年级级」；② 当 group key 为兜底值时弱化或隐藏 `grade-title`（或改 label 为「未设置年级」并降为 subtitle 色）；③ 卡片为空时给 `部长` 补一个「去完善资料」CTA 跳 `/profile`，让空卡变引导位。

### A4. 🟡 首页下半屏大段空暗区，信息密度失衡

**截图证据**：`home.png` KPI 行 + 面板只占满视口约 60%，剩余约 35% 是纯画布暗区「悬空」；`tasks.png` / `ideas.png` / `projects.png` / `posts.png` 同样在 900px 高下大面积留白。

**代码位置**：`views/HomeView.vue:225-230`（`.cols { align-items: start }`，左右列各自 auto 高度，不撑满）、`settings` 无整体 `min-height`；主面板 `panels` 高度随内容收缩。其余列表页为纯内容流，无占位高度。

**设计依据**：dashboard 应在「内容不足」时仍保持视觉重心，或明确是滚动流而非固定首屏；大片空白会让人觉得「页面坏了/没加载完」。

**修复建议**：给 `.cols` 或 `.main-col/.side-col` 加 `min-height`（如 `calc(100dvh - 头/导航高)`）并让面板 `align-items: stretch` 撑满；或是用「骨架+占位」让短数据不显空。至少给首页面板加 `flex:1` 拉伸。

### A5. 🟡 通知类型以英文标识直出（report/announcement/mention/task），与全站中文冲突

**截图证据**：`home.png` 右侧「通知」列表每行标签是 `report` / `announcement` / `mention` / `task` 英文；其余页面文案全中文。

**代码位置**：`views/HomeView.vue:150-151`（`{{ n.type }}`）；铃铛面板同：`components/NotificationBell.vue:86`（`{{ n.type }} · {{ createdAt }}`）。

**设计依据**：面向成员的界面应全中文；把后端枚举 `type` 直接渲到 UI 是未做本地化映射，观感「半成品」。

**修复建议**：建一个 `typeLabel` 映射（`report→举报`、`announcement→公告`、`mention→@提及`、`task→任务`），HomeView 与 NotificationBell 共用；或由后端返回中文 `typeLabel`。

### A6. 🟢 等宽字体未真正加载（JetBrains Mono 仅存于 font-family，无 @font-face）

**代码位置**：`assets/main.css:104-108`（注释自述「未引入 @font-face/CDN，已装用户优先，否则回退系统等宽栈」）；`theme/tokens.ts:63` 的 `mono` 档与 `theme/index.ts:47` 的 `fontFamilyMono` 均引用 JetBrains Mono。

**影响**：`agent.png` 第②步的 JSON 配置块与各类 `tnum` 数字大概率落在系统等宽，字形与设计态（JetBrains Mono）不一致，code 块观感略「素」。

**修复建议**：若在意 code/数字质感，自托管 JetBrains Mono 子集（woff2，`main.css` 加 `@font-face`）；否则忽略，属可接受回退。

### A7. 🟢 铃铛面板阴影偏重，与「层级靠表面色」纪律略有出入

**截图证据**：`agent.png` / `home.png` 通知铃铛下拉面板有较明显的投影。

**代码位置**：`components/NotificationBell.vue:100`（`box-shadow: var(--cs-shadow-raised, 0 8px 24px rgba(0,0,0,0.4))`）。

**设计依据**：dark-saas 主张「surface 分层 + 1px hairline，避免粗投影」；浮层可用 surface-2 + hairline 区分，投影克制即可。

**修复建议**：`--cs-shadow-raised` 在 token 里已是 `0 4px 12px rgba(0,0,0,0.3)`，此处回退值写死了更重的 `0 8px 24px 0.4`，建议统一走 `--cs-shadow-raised`（删掉回退硬编码值）。

### A8. 🟢 发布时间粒度不统一（有的带时分，有的只到日期）

**截图证据**：`posts.png` / `home.png` 显示 `2026-08-15 06:08`（带时分）；`ideas.png` / `projects.png` 显示 `2026-08-15`（仅日期）。

**代码位置**：带时分：`HomeView.vue`（通知/公告中 `slice(0,16)`）、`PostListView.vue:83`、`NotificationBell.vue:86`；仅日期：`IdeaListView.vue:81`（`slice(0,10)`）、`ProjectListView.vue:71`（`slice(0,10)`）。

**设计依据**：同站点内「发布时间」应有一套统一规则（建议：当天显示时分，跨天显示日期，或用 lib 统一格式化），避免用户对「时间到底到没到分钟」产生困惑。

**修复建议**：抽一个 `formatTime(iso)` / `formatDate(iso)` 统一到 `lib/`，各处替换 `slice`。

### A9. 🟢 帖子「已删除」项仍以原文标题 `[已删除]` 出现，正文为「(内容已被删除)」

**截图证据**：`posts.png` 第二条帖子标题为 `[已删除]`，正文 `(内容已被删除)`，仍占一个卡片位。

**代码位置**：数据由后端返回（`PostListView.vue:37` 直接渲染 `p.title`/`p.content`），前端未对已删除帖做特殊态。

**设计依据**：已删除内容应弱化为「占位」而非与正常帖同权展示，或干脆不展示（或显示「该帖已被删除」灰字而非标题）。

**修复建议**：后端提供 `deleted` 标记，前端对 `deleted === true` 帖渲染为灰阶占位条（禁用跳转），避免与真实帖抢视觉。

---

## 二、交互逻辑问题清单

> 重点：状态流一致性 / 交互闭环 / 可发现性 / 冗余与矛盾 / 性能渲染 / 细节逻辑。

### L1. 🔴 同一屏「未读通知」两个来源互相矛盾（首页 KPI 显示 5，顶栏铃铛显示 4）

**场景**：`home.png` 右侧 KPI 卡「未读通知 5」，而右上角铃铛徽标是「4」，同一时刻同一指标两个数字。

**代码位置**：
- 首页 KPI：`views/HomeView.vue:47-52`（`kpi.unread` 由 `/api/notifications` 返回数组 `.filter(!n.read).length` 计算，`HomeView.vue:65` 拉取、`:111` 渲染）
- 铃铛徽标：`components/NotificationBell.vue:19-21`（由 socket 事件 `notification:unread` 的 `count` 字段直接赋值，`:76` 渲染）

**为什么是问题**：两者计算/缓存来源完全不同——KPI 是「页面加载时快照自行数一遍」，铃铛是「socket 实时下发的服务端 count」。任何一方数据更新（有人读了、或 socket 推送与 REST 拉取时序差）都会让两个数字分叉；同屏出现两个「未读数」是最典型的信任危机。

**优化建议**：统一收敛到单一数据源。建议：① 铃铛徽标与首页 KPI 都用同一个 store（如 `useNotificationStore`）维护 `unreadCount`，socket 事件只更新该 store，首页 KPI 直接读 `store.unreadCount` 而非自行 filter；② 或至少首页 `load()` 完成后将 `kpi.unread` 回写到铃铛（反向同步）。优先方案是把「未读数」收敛为唯一的 `notificationStore`，杜绝两处重复计算。

### L2. 🔴 会话 restore 与首屏加载竞态：首页在 `auth.user` 尚未还原时即发请求

**场景**：硬刷新 `/`（或从深链进入），工作台在 `/api/auth/me` 尚未返回时就用空 `user.id` 查询 `/api/tasks?assigneeId=`，导致「我的任务」KPI 与列表取到错误数据（全部任务或空），且 restore 完成后页面不会自动重查。

**代码位置**：
- `main.ts:14`：`useAuthStore(pinia).restore()` 未 await、未挂载到 app 生命周期，启动即后台异步
- `stores/auth.ts:50-68`：`restore()` 异步拉 `/api/auth/me` 填充 `auth.user`；`state` 初始 `user: null`（`auth.ts:22`）
- `views/HomeView.vue:54-77,79`：`load()` 在 `onMounted` 调用（`HomeView.vue:79`），此时 `auth.user` 可能仍为 `null`；`HomeView.vue:63` 用 `auth.user?.id ?? ''` 拼 query

**为什么是问题**：`restore()` 与首屏 `load()` 无任何时序保证，且首页只 `onMounted` 触发一次、不 watch `auth.user`。属「登录态切换后视图状态不自洽」+「未取消/未重查异步」的竞态。

**优化建议**：① 让 `HomeView.load()` 依赖 `auth.bootstrapped`（`auth.ts:23` 已有该标志），用 `watch(() => auth.bootstrapped, ...)` 等其置 `true` 后再查询；② 或在 `main.ts` 里将 `restore()` 变为可等待并在 `router.beforeEach` 的 `to` 首次遍历后 resolve（Promise 化），避免首屏空 user；③ 最稳妥：给 `api()` 的鉴权请求加「若 user 未就绪则等待 bootstrapped 再发」的守卫。

### L3. 🔴 审批页「无数据」出现两层空态（表格内置 + 页面级空态叠加）

**场景**：`approvals.png` 表格区内显示「无数据」，表格下方又出现独立的 `⬡ 没有待审批的操作`，两个空态同时抢镜。

**代码位置**：`capabilities/approvals/ApprovalsView.vue:103-112` —— `n-data-table`（`:103`）始终渲染，Naive 在 `data=[]` 时自动展示内置空态「无数据」；随后 `:112` 又渲染 `<empty-state text="没有待审批的操作">`。两者互不排斥，叠加出现。

**为什么是问题**：同一「无数据」条件下给出两条不同文案、两套图标的空态，语义重复且视觉打架，用户会困惑「到底算有还是没有」、到底信哪个。

**优化建议**：让二者互斥——只保留一个。推荐：`v-if="items.length"` 时才渲染 `n-data-table`，否则只渲染 `EmptyState`（去掉表格内置空态）；或给 DataTable 塞 `:empty` 空态插槽统一文案。同时确认 L1/KPI 之外的「全部已读」「暂无待审批」等空态状态机一致。

### L4. 🟡 技能编辑「双入口」冗余（一个下拉支持自定义，又一个独立自定义输入框）

**场景**：`profile.png` 技能区同时有「从分类中选择，或输入自定义标签」的下拉（`tag`/`filterable` 模式）和下方一个「自定义技能」输入框 +「添加」按钮。

**代码位置**：`capabilities/profile/ProfileView.vue:118-131` —— `n-select` 已开 `multiple filterable tag`（`:118-127`，本身就能输入新增自定义标签），`custom-row`（`:128-131`）又提供第二套自定义新增。

**为什么是问题**：同一能力两条交互路径，用户不确定该用哪个；且 `addCustomSkill`（`:82-88`）与 select 的内部 tag 逻辑可能产生「加了两次/去重不一致」的边界。

**优化建议**：二选一。推荐保留 `n-select tag` 单一入口（更符合「词表选择+自定义」），删除 `custom-row`；或保留输入框但把下拉改成 `multiple filterable` 不带 `tag`，让「自定义」只走输入框，避免双入口。

### L5. 🟡 首页通知行看起来可点但不可点（cursor: default + 无跳转）

**场景**：`home.png`「通知」列表每行是 类型标签+标题 的完整行，视觉上像可点击条目，但徽标面板（铃铛）里通知可点击跳转，首页这里却无任何可点反馈（`cursor: default`，无 href）。

**代码位置**：`views/HomeView.vue:148-155`（`v-for` 渲染 `div.nrow`，`:284-286` `.nrow { cursor: default }`）；对比铃铛面板是`NotificationBell.vue:83`（`@click="n.link && ($router.push(n.link), open=false)"`）。

**为什么是问题**：同是「通知」，一处在网关处可跳转、一处在首页不可跳转，用户点击无响应，属「关键操作找不到/状态与预期不符」的可发现性缺陷。

**优化建议**：让首页通知行复用铃铛的 link 逻辑：若 `n.link` 存在则包 `RouterLink` 并 `cursor:pointer`+hover 态；无 link 的显示为「仅展示」弱化（去 hover、去 pointer），避免「像可点却点不动」。

### L6. 🟡 复制配置失败时把整段 JSON 塞进 toast

**场景**：`agent.png` 第②步「复制配置」在非安全上下文（http 非 localhost）或剪贴板被拒时，`message.info(text)` 会把多行 JSON 直接倒成一个提示气泡。

**代码位置**：`capabilities/agent/AgentView.vue:55-63`（`copy()` 里 `catch { message.info(text) }`，`configs.claude` 为多行 JSON）。

**为什么是问题**：toast 不适合承载多行代码/长文本，会被截断且不可选中复制，兜底等于没兜底。

**优化建议**：剪贴板失败时改用弹窗（`n-modal`）内嵌一个 `<pre>` 高亮 + 「复制」「全选」按钮（可选中），或至少 `message.warning('剪贴板不可用，请手动复制』)` 并同时打开该预格式化弹窗。同时 `copy()` 里对 clipboard 权限可用性做一次前置检查。

### L7. 🟡 socket 断线后未读数不重新对齐

**场景**：网络抖动/服务重启导致 socket.io 断开又自动重连后，铃铛「未读数」与原值不一致（socket 未重发 `notification:unread`/`notification:list`）。

**代码位置**：`components/NotificationBell.vue:13-38,63-70` —— `connect()` 只在 `onMounted` 建立一次连接，仅对 `notification:unread`/`new`/`list` 事件赋值，未监听 `connect`/`reconnect` 事件，也未在重连成功后主动 `emit('notification:fetch')` 重拉全量。

**为什么是问题**：socket.io 默认自动重连，但计数是「增量累计」的，断线期间丢失的推送（新通知、他人已读）不会被追平，导致徽标长期漂移，属「socket 断线重连」细节逻辑缺失。

**优化建议**：`sock.on('connect', () => { sock.emit('notification:fetch'); })`，并在 `notification:list` 回调里用服务端全量覆盖 `list` 与 `unread`（而不是 `notification:new` 里 `+= 1` 纯累加）。把「未读数」收敛到 store（见 L1）后，重连时 `store.unreadCount = (await list).filter(!read).length` 对齐。

### L8. 🟡 看板卡片徽章显示的是「优先级」而非「状态」，与列头状态语义错位

**场景**：`tasks.png` 已完成列里的卡片，其左上角徽章是红色「高/紧急」（优先级），而所在列标题是「已完成」（状态）。用户会误以为这是「已完成」的状态徽章。

**代码位置**：`capabilities/project/TaskBoardView.vue:239`（`<status-badge :status="el.priority" type="priority" />`）；而状态信息其实靠「所在列」承载。

**为什么是问题**：状态与优先级用同一视觉元素表达，且标题（t-title）只在 column 内才有上下文，卡片本身不显示状态，容易让用户在「拖到哪列」与「徽章颜色」之间产生歧义。

**优化建议**：卡片上同时给出「状态（列内由列头表达）+ 优先级徽章」，建议把优先级用更弱化的方式（如左侧 2px 描边色，`TaskBoardView.vue:348,358-364` 已有 `pri-*` 左边框）表达，而徽章留给状态；或在卡片 meta 行显式标注状态文字（如「进行中」）。

### L9. 🟢 首页「招募中的点子 / 我的任务」行标题与链接归属稍显含糊

**场景**：`home.png` 首页任务行没有项目/状态以外的跳转目标提示，`招募中的点子` 行的 `🔧 需求` 与标题在窄行里可能被 `max-width:40%` 截断（`HomeView.vue:275-283`）。

**代码位置**：`views/HomeView.vue:134-138`（`.t-need` 用 `max-width:40%` + ellipsis），`HomeView.vue:269-274`（`.t-title` 单行截断）。

**为什么是问题**：`max-width:40%` 的固定比例在超长需求文案下会先挤掉标题，且截断无 tooltip，用户无法看到完整「缺什么」。

**优化建议**：给 `.t-need` 加 `title` 属性或改用两行布局；或 `flex:1` 让标题优先、need 用 `max-width:40%` 且加 `title` 悬浮提示。

### L10. 🟢 项目进度「1/1」已完成但无「已完成」语义提示

**场景**：`projects.png` 项目卡进度条为 100%（1/1），但仅显示「1/1」数字，没有「已完成」状态标识。

**代码位置**：`capabilities/project/ProjectListView.vue:61`（`p.doneTaskCount/p.taskCount`）与 `:62-68`（进度条）。

**设计依据**：`doneTaskCount === taskCount` 时应给一个弱化的「已完成」角标（或复用 StatusBadge），让「进度满」与「项目完结」可区分。

**修复建议**：`p.doneTaskCount >= p.taskCount && p.taskCount > 0` 时，在进度行尾加一个 `success` 色「已完成」tag。

---

## 三、亮点清单（做得好的点）

1. **dark-saas token 体系落地干净**：`theme/tokens.ts:15-53` 4 级表面 + hairline + ink 分层、单一 `#58a6ff` 强调色、`#0d1117` 近黑画布，且全部映射进 `naive-ui` overrides（`theme/index.ts`），层级靠表面色而非阴影，符合 Linear 式纪律。截图整体观感「沉而不闷」。
2. **KPI 首行用强调色突出「未读通知」**（`HomeView.vue:111` `accent`）——在四个同构 KPI 里用颜色区分「属于『通知』类」与非任务类，是正确的信息权重设计。
3. **状态徽章语义色规范**：`StatusBadge.vue:13-38` 用 `color-mix` 实现「8% 透明底 + 语义色描边 + 语义色文字」，`ideas.png` 招募中绿/已转正黄、`announcements.png` 重要黄、`tasks.png` 优先级红都清晰可辨，不刺眼。
4. **空态统一组件 + CTA 引导**：`EmptyState.vue` 给「暂无任务」「暂无成员」都带了「去创建/去点子墙」引导按钮（`HomeView.vue:128,140,165,166`），把空页面变成行动入口，这是很多人忽略的地方。
5. **按钮对比度已达标**：`theme/index.ts:53-68` 统一实心底深字（`#0d1117` on `#58a6ff` 达 AA），且 `agent.png` 「授权我的助手」蓝底深字清晰。
6. **Agent 接入页信息架构清晰**：`agent.png` 四步编号（①授权→②复制配置→③可见工具→④内置 bot）讲清「为什么要用、怎么用、能干什么、去哪问」，是本期截图里信息密度与可读性最好的页面；工具行 +「需审批」badge 与审批页语义一致。
7. **任务看板拖拽与键盘/禁拖双入口**：`TaskBoardView.vue:72-84` 提供「⋯ 下一步」下拉替代（`FLOW_LABEL` 认领/提交验收/通过验收），并做了 `touch-action/ delay` 触屏防误触（`:218,353`），移动端 `tasks.png` 可横滑（`:416-431` + 右缘渐隐），交互健壮性好。
8. **移动端离壳认证页**：`LoginView.vue` 独立 360px 居中卡片、`100dvh`、清空 focus 环，`App.vue:32,99-124` 认证页不渲染侧栏/顶栏，干净。

---

## 四、优先优化 Top 10

| # | 事项 | 类别 | 级别 | 理由 | 预估工作量 |
|---|---|---|---|---|---|
| 1 | 全站统一图标（emoji/⬡/SVG → 一套 linear SVG） | 审美 | 🔴 | 三套图标并存割裂质感、破坏单强调色纪律，涉及面广但改动机械 | 中（约 5~6 文件、12 处） |
| 2 | 收敛「未读数」到唯一 store，消除同屏计数矛盾（KPI 5 vs 铃铛 4） | 逻辑 | 🔴 | 最伤信任的自洽问题；引 notificationStore 收口 | 中 |
| 3 | 修复 restore 竞态：首页等 `bootstrapped` 后再查询、restore 可等待 | 逻辑 | 🔴 | 刷新后分类/首页数据错位，影响「我的任务」正确性 | 中 |
| 4 | 审批页双空态互斥（表格 vs 页面空态二选一） | 逻辑 | 🔴 | 同一条件下两条空态文案打架，语义重复 | 小 |
| 5 | 个人资料表单居中 + 缓解右侧空区 | 审美 | 🟡 | 明显布局失衡，一行 `margin:0 auto` 即改善 | 极小 |
| 6 | 成员页「未知年级级」拼串 + 空卡引导 | 审美/逻辑 | 🟡 | 数据兜底当正式标题的「半成品感」；杜绝双「级」 | 小 |
| 7 | 通知类型英文→中文映射（report/… 本地化） | 审美 | 🟡 | 全站中文语境下直出英文枚举，观感半成品 | 小 |
| 8 | 技能双入口冗余合并 | 逻辑 | 🟡 | 同一能力两条交互路径，易困惑、去重边界不清 | 小 |
| 9 | 首页通知行可点性/导航对齐（复用铃铛 link 逻辑） | 逻辑 | 🟡 | 可发现性缺陷：像可点却点不动 | 小 |
| 10 | socket 断线重连后未读对齐 + 复制失败弹窗化 | 逻辑 | 🟡 | 断线计数漂移、剪贴板失败兜底形同虚设 | 小 |

---

## 附：评审证据边界（诚实声明）

- **移动端登录页未能评估**：`/tmp/shots-mobile/login.png` 与 `home.png` 经 `md5sum` 与 `cmp` 校验为**字节级完全相同**（同一文件）。原因是登录态下 `/login` 被路由守卫（`router/index.ts:33-35`）重定向到 `/`，截图实为「已登录工作台」。故本次**未对移动端登录表单做视觉评审**；其结构良好（`LoginView.vue` 360px 卡片、100dvh、focus 环）。
- **生产容器可能落后于 HEAD**：截图为 `127.0.0.1:8092`（生产镜像），而代码基线为 `7dbdfd1`。个别截图现象（如成员页标题显示「未知年级」而不带「级」）与当前代码（`MembersView.vue:56` 会渲染「未知年级级」）不完全一致，疑为生产容器未重建或字号过小所致。相关结论已按「代码逻辑事实」而非「截图表象」表述。
- 本轮视觉推理预算已耗尽，未对全部截图做二次放大核对；「/」「×」「✓」等细节以代码与截图整体观感为准。
