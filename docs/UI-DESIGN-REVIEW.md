# CyberSWAT 开发部子站 UI/UX 设计评审报告

- **评审对象**：`cyberswat-dev-portal`（dev.cyberswat.cn，已上线生产），前端 `apps/web/src`（Vue3.5 + Vite + TS + Pinia + Naive UI 2.44.1）
- **评审基准**：仓库 HEAD `9cd7241`（2026-08-15）
- **评审范围**：仅 UI/UX 设计质量（token 体系 / 深色科技风一致性 / 排版 / 色彩对比度 / 间距布局 / 组件细节 / 状态设计 / 视觉层级 / 可访问性 / 动效）
- **方法**：通读 `apps/web/src` 全部 20 个 `.vue` 页面与组件、`theme/tokens.ts`、`theme/index.ts`、`assets/main.css`，grep 检索硬编码色值 / px 字号 / 未定义 CSS 变量 / @media / focus / aria 等；所有论断均附 `file:line` 证据
- **修复状态（2026-08-16）**：✅ **Top 10 已全部修复并上线**（🔴-1/🔴-2 + 🟡-1~🟡-11 主体；详见 §四 状态列），测试 67/67 全绿

---

## 一句话总体评价

**这是一套"骨架非常专业、细节多处漏气"的 dark-saas 实现**：token 体系、卡片语言、排版纪律、主题覆盖都达到了 Linear 式深色 SaaS 的合格水准，但存在 2 处真实可见的视觉破损（通知面板变量失效、主按钮对比度不达标）与一批系统性打磨缺口（零响应式、a11y 空白、状态三态不完整），属于"设计系统已立、执行一致性未闭环"的状态。

## 设计成熟度评分：76 / 100

| 维度 | 得分 | 简评 |
|---|---|---|
| Token 体系 | 85 | 4 级表面/hairline/ink 层级清晰，唯一强调色纪律好；但 token 双源（tokens.ts vs main.css）已出现漂移并造成真实故障 |
| 深色科技风一致性 | 80 | 卡片/面板/列表视觉语言高度统一；但有 2 个文件仍用旧变量体系，风格撕裂 |
| 排版 | 78 | 主字号阶梯收敛得很好；但 11px/10px/16px/22px 越界值散布约 20 处 |
| 色彩与对比度 | 72 | 正文层级全部达标（≥4.5:1）；主按钮白字 2.53:1 系统性不达标 |
| 间距与布局 | 70 | 桌面端节奏统一；全站 0 条 @media，窄屏直接崩溃 |
| 组件细节 | 78 | naive-ui 主题覆盖全面；自定义按钮/自绘输入与体系有出入 |
| 状态设计 | 70 | 多数列表三态齐全；看板无 loading、首页 loading 未用、两处错误态误显示空态 |
| 视觉层级与 IA | 80 | 页头/区块标题/密度整体专业；菜单图标、动作 affordance 不一致 |
| 可访问性 | 55 | 无 focus-visible、零 aria、原生 prompt、拖拽无键盘替代 |
| 动效 | 75 | hover/transition 节奏统一；无路由过渡、无 reduced-motion |

---

## 二、问题清单

### 🔴 设计硬伤（视觉/体验明显破损）

#### 🔴-1 通知面板使用未定义的 CSS 变量 → 面板透明、无边框、无底色
- **位置**：`apps/web/src/components/NotificationBell.vue:83-93`（`var(--fg)`、`var(--panel)`、`var(--border)`、`var(--muted)`、`var(--accent)`）
- **问题**：全站变量体系是 `--cs-*`（`assets/main.css:3-21` 只定义了 16 个 `--cs-*` 变量）。grep 全仓确认 `--fg/--panel/--border/--muted/--accent` **在任何地方都没有定义**。`background: var(--panel)`、`border: 1px solid var(--border)` 在计算值时整体失效 → 通知下拉面板渲染为"悬浮文字 + 阴影、无背景无边框"，内容直接叠在页面卡片上，几乎不可读；`color: var(--fg)` 失效后回退到继承色。
- **设计依据**：dark-saas 纪律第 3 条"页面内禁止裸色值"+ token 必须真实可解析；一个面板引用一套不存在的变量名，属于"风格撕裂"最典型的形式，且是生产可见的破损。
- **修复建议**：全部改回 `--cs-surface-2 / --cs-hairline / --cs-ink-muted / --cs-ink-subtle / --cs-accent`；第 84 行角标 `#f85149/#fff` 改用 `var(--cs-danger)` + `var(--cs-ink)`；删除 89 行裸 rgba。另建议加一条 CI 检查：grep 所有 `var(--` 引用的名字必须存在于 main.css。

#### 🔴-2 主按钮白字 on `#58a6ff` 对比度仅 2.53:1，系统性不达 WCAG AA
- **位置**：`theme/tokens.ts:35-37`（accent `#58a6ff` + onAccent `#ffffff`）→ 影响所有 `n-button type="primary"`（如 `TaskBoardView.vue:146`、`ProfileView.vue:159`、`AnnouncementNewView.vue:58`、`IdeaDetailView.vue:90`、`PostDetailView.vue:130` 等）以及自绘主按钮 `HomeView.vue:339-341`、`LoginView.vue:167-171`、`AgentView.vue:259-267`
- **问题**：实测对比度：白字 `#fff` 在 `#58a6ff` 上 = **2.53:1**（远低于正文 4.5:1 的 AA 线）；`#58a6ff` 是设计用来做**深底上的文字/链接色**的亮蓝（在画布上 7.5:1 达标），拿来当按钮底色再叠白字是误用。同类问题：`success #3fb950` 上白字 2.54:1、`danger #f85149` 上白字 3.35:1（`TaskBoardView` 通过/驳回按钮、`ModerationView.vue:78` 删除内容按钮）。
- **设计依据**：评审范围明确要求"按钮对比度达 WCAG AA（4.5:1）"；CTA 是全页最重要的文字，恰是最低对比度，属于"对比度过低"的硬伤。GitHub Primer 深色模式的主按钮用的是更深的 `#238636`（白字 4.63:1），正是为规避此问题。
- **修复建议**（二选一）：① 按钮底色加深为 `#1f6feb`（白字约 4.64:1，仍是同色相蓝）；② 保留 `#58a6ff` 底、文字改深色 `#0d1117`（对比 7.5:1，Linear 风格更"悬浮"）。推荐 ②，品牌色零改动、且与"accent 只做点缀"的纪律更契合。

---

### 🟡 重要（不一致 / 体验破损但不致命）

#### 🟡-1 全站 0 条 @media，窄屏直接崩溃
- **位置**：全仓 `grep "@media"` = 0 条；`App.vue:61-70`（固定 220px 侧边栏）、`HomeView.vue:186-217`（KPI 4 列 + 2fr/1fr 双栏）、`TaskBoardView.vue:232-237`（看板 4 列）、`AgentView.vue:230-235`（2 列）
- **问题**：没有任何断点与窄屏策略。视口 < 768px 时：侧边栏吃掉 220px、KPI 4 列挤成 4 个细条、看板 4 列卡片宽度不足 100px、`TaskBoardView.vue:200` 的 480px 固定宽弹窗直接溢出。dev 站经 CF Tunnel 公网可达，手机打开即不可用。
- **设计依据**：评审范围第 5 条明确包含"响应式（窄屏/移动端是否崩）"。对内部工具可以桌面优先，但"完全没有兜底"与"有断点但简陋"是两种成熟度。
- **修复建议**：最小成本方案——`@media (max-width: 900px)` 看板改横向滚动（每列 `min-width: 260px`）、KPI 改 2 列、`cols` 改单列；`@media (max-width: 640px)` 侧边栏默认折叠。预估 0.5 天。

#### 🟡-2 token 双源漂移：`--cs-hairline-subtle` 未定义却已被引用，分隔线静默消失
- **位置**：定义缺失于 `assets/main.css:3-21`（只导出 hairline / hairline-strong，**没有** hairline-subtle）；`tokens.ts:26` 定义了 `hairlineSubtle`；引用处 `HomeView.vue:247`（列表行 `border-bottom`）、`AgentView.vue:299`（工具条目边框）
- **问题**：`tokens.ts` 与 `main.css` 是两份手工同步的清单，已漂移。`1px solid var(--cs-hairline-subtle)` 计算值失效 → 首页"我的任务/点子"列表行分隔线全部消失、Agent 页工具条目失去卡片边框，视觉层级被悄悄削弱。
- **设计依据**：token 的价值在于"一处定义、处处引用"；出现"定义了但没导出"与"引用了但没定义"并存，说明单源缺失。
- **修复建议**：① 立即在 main.css 补 `--cs-hairline-subtle: #21262d`；② 治本——改由 `tokens.ts` 生成 CSS 变量（构建期注入），消除双源。

#### 🟡-3 StatusBadge 的 `borderColor: var(--x)55` 是非法 CSS，描边意图整体落空
- **位置**：`components/StatusBadge.vue:48`（`:style="{ color: meta.color, borderColor: \`${meta.color}55\` }"`）
- **问题**：`var(--cs-ink-subtle)55` 在 CSS 变量替换后得到 `#8b949e 55` 两个 token，`border-color` 语法不接受 → 声明失效回退（样式表 `border: 1px solid transparent` 生效）→ 徽章**永远没有描边**，注释声称的"8% 透明底 + 语义色描边"实际是纯文字。功能上"没坏"，但设计意图（带浅色描边的胶囊徽章）从未生效。
- **设计依据**：CSS 变量不支持与字面量拼接出颜色；`var()` 后跟 hex 后缀是经典反模式。
- **修复建议**：用 `color-mix(in srgb, var(--cs-accent) 33%, transparent)` 或直接定义 `--cs-accent-soft` 等语义 alpha 变量。

#### 🟡-4 四处原生 `window.prompt/confirm`，与深色设计语言完全割裂
- **位置**：`TaskBoardView.vue:100`（提交说明）、`ProjectDetailView.vue:50`（提交说明）、`PostDetailView.vue:57`（举报原因）、`PostDetailView.vue:71`（删除确认）
- **问题**：原生浏览器对话框是亮色系统 UI、不可定制、无主题、无焦点管理、可被浏览器拦截，且与全站 n-modal/n-dialog 体系并存的观感是"两种产品"。提交说明是任务流转的核心输入，却塞进一个无校验的 prompt。
- **设计依据**：评审范围第 6 条"弹窗…与设计语言一致"；生产站出现系统级对话框属于体验割裂。
- **修复建议**：`submit/review` 用 n-modal + n-input（参考 `TaskBoardView.vue:200` 已有新任务弹窗范式）；删除确认用 `useDialog()` 的 n-dialog。预估 0.5 天。

#### 🟡-5 状态三态缺口：看板无 loading、首页 loading 未渲染、两张表错误态误显示空态
- **位置**：`TaskBoardView.vue`（无 `loading` ref、无 n-spin：`load()` 期间 4 列显示"0 条"空列）；`HomeView.vue:44`（`loading` ref 定义了但模板 82-177 行从未读取 → 首屏直接闪"暂无任务 / 去创建第一个任务"空态，误导用户以为没数据）；`ModerationView.vue:31-39 + 100`、`ApprovalsView.vue:23-31 + 102`（加载失败只弹一次 toast，随后渲染"暂无待处置举报 / 没有待审批的操作"——管理员会把**出错**误读成**没有工作**）
- **设计依据**：评审范围第 7 条"loading/empty/error 三态是否每个列表都有"；错误态显示空态是明确的状态设计错误。
- **修复建议**：看板补 `loading` + 列内 skeleton；HomeView 补 `v-if="loading"` 的骨架/占位；两表页错误时渲染 error 区块（带重试按钮）而非空态。

#### 🟡-6 可访问性整体空白：无 focus-visible、零 aria、看板拖拽无键盘替代、自绘输入无 label
- **位置**：全仓 `grep "focus-visible"` = 0（仅 `LoginView.vue:155` / `RegisterView.vue:147` 有 `:focus`）；`grep "aria-"` = 0；`grep "tabindex"` = 0；自定义按钮（`NotificationBell.vue:63` 铃铛、`EmptyState.vue:17` CTA、`AgentView.vue:176` 授权按钮、`InvitesView.vue:146` 复制、各 `confirm-btn`）全部无焦点可见态；看板 `TaskBoardView.vue:158-195` 拖拽（vue-draggable-next）无键盘替代路径（无"移动任务"菜单/快捷键），键盘用户无法改变任务状态；登录/注册输入框（`LoginView.vue:72-73`）只有 placeholder 无 `<label>`/aria-label
- **设计依据**：评审范围第 9 条明确点名"焦点可见态、aria-label、键盘可达性（尤其拖拽看板）"。深色主题下没有 focus 环，键盘用户完全无法定位焦点。
- **修复建议**：全局加 `:focus-visible { outline: 2px solid var(--cs-accent); outline-offset: 2px }`（一条规则覆盖所有自定义按钮）；铃铛按钮加 `aria-label="通知"` + `aria-expanded`；看板卡片补一个"移动到…"下拉（复用 `move()`）；auth 输入补 `aria-label`。预估 0.5-1 天。

#### 🟡-7 登录/注册页渲染在应用壳内：双"登录"入口 + 布局错位
- **位置**：`App.vue:56-109`（所有路由都渲染在 NLayout 壳内）→ `LoginView.vue:92-98`（`.auth-wrap { min-height: 100vh }` 嵌在带 padding 的 content 里）
- **问题**：未登录访问 /login 时，侧边栏（含 `sider-foot` 的"?"头像 + undefined 昵称，`App.vue:76-82`）与顶栏（`App.vue:97` 又渲染一个"登录"按钮）全部可见——登录页同时存在两个"登录"入口；且 `min-height:100vh` 的居中区比实际可视区（减掉 56px 顶栏）高，卡片垂直居中下偏约 28px 并出现多余滚动。
- **设计依据**：认证页惯例是脱离应用 chrome 的全屏干净画布；壳内冗余入口 + 100vh 错位属于"层级混乱"。
- **修复建议**：路由级 layout 切换（auth 路由不套 NLayout，或 App.vue 用 `route.meta.public` 判断隐藏 sider/header）；`auth-wrap` 改用 `100dvh` 且容器自适应。

#### 🟡-8 侧边栏菜单只有首页有图标；折叠态其余项无可视标识
- **位置**：`App.vue:19-31`（`menuOptions` 仅 home 项带 `icon: '⌂'`，能力包菜单项 `ui/manifest.ts` 全无 icon 字段）
- **问题**：展开态是"一个图标 + 一串纯文字"的混合菜单，视觉节奏断裂；折叠到 64px 时，无图标的 n-menu 项（推测）退化为空白/占位点，用户无法辨认"公告/任务/社区"。
- **设计依据**：评审范围第 8 条"侧边栏菜单组织"；图标是深色 SaaS 侧栏的信息锚点，缺一不可。
- **修复建议**：给 `UiContribution.menu` 加 `icon` 字段（统一用 `@vicons` 线性图标集替代 ⌂/⬡ 文本字形），至少保证折叠态可用。

#### 🟡-9 动作 affordance 不一致：同是"新建"，有的用按钮、有的用文本链接
- **位置**：按钮式——`TaskBoardView.vue:146`（n-button primary "＋ 新任务"）、`InvitesView.vue:136-137`；文本链接式——`HomeView.vue:85-87`（"＋ 发点子 / 新任务 / 发帖"）、`AnnouncementListView.vue:61`、`IdeaListView.vue:53`、`PostListView.vue:57`
- **问题**：同为页面主 CTA，"＋ 发布公告"是弱化文本链接、"＋ 新任务"是实心按钮，权重感知完全相反；且 `HomeView.vue:86` 的"新任务"链接指向 `/tasks` 看板而不是新建弹窗，文案与目标不符。
- **设计依据**：主操作 affordance 应全站统一（都该是 primary 按钮或都该是链接+进入对应创建页）。
- **修复建议**：统一为 `n-button type="primary" size="small"`；"新任务"链接改为触发看板弹窗或改文案为"任务看板"。

#### 🟡-10 示例页进入生产菜单，且是唯一使用旧变量体系的页面
- **位置**：`capabilities/example/example.ui.ts:7`（`menu: [{ path: '/example', label: '示例' }]` 无 roles 限制 → 所有登录用户可见）；`ExampleView.vue:14-17`（`var(--panel)/var(--border)/var(--muted)/var(--accent)` 未定义 + 硬编码 `#21262d`）
- **问题**：生产菜单出现"示例"调试页，样式还引用不存在的变量（卡片透明无边框），是全站风格撕裂的第二处（与 🔴-1 同源）。
- **修复建议**：从 `ui/manifest.ts:20` 移除 `exampleUi`（或菜单项加 `roles: ['admin']` 并仅 dev 环境注册）；页面改用 `--cs-*`。

#### 🟡-11 排版越界：11px/10px 元信息 ×10 处、16px 区块标题 ×5 处、22px 登录标题，均不在 typeScale
- **位置**：typeScale 定义 `tokens.ts:55-63`（meta 最小 12px）；越界实例：`App.vue:162`（11px role）、`HomeView.vue:280/288`（11px）、`TaskBoardView.vue:297/306/310`（11px）、`PostDetailView.vue:141`（11px）、`NotificationBell.vue:84`（10px 角标）、`NotificationBell.vue:92`（11px）；16px：`IdeaDetailView.vue:185`、`ProjectDetailView.vue:186`、`PostDetailView.vue:180`、`ProjectListView.vue:117`；22px：`LoginView.vue:126`、`RegisterView.vue:113`（auth 标题）
- **问题**：10-11px 在 14px 正文体系里低于可读下限（尤其 `NotificationBell.vue:84` 的 10px 角标还叠加 3.35:1 对比度问题）；16px"区块标题"与 15px cardTitle 重复造轮子；22px 与 24px pageTitle 并存。
- **设计依据**：tokens.ts 注释明言"字号阶梯（收敛）"，但收敛只完成了一半。
- **修复建议**：11px 全部升到 12px（meta）；16px 区块标题统一用 15px cardTitle（或把 16px 收编进 typeScale 作为 sectionTitle）；auth 标题直接用 pageTitle 24px。

#### 🟡-12 语义色滥用：状态色被用于非状态分类、同义状态同色
- **位置**：`PostListView.vue:26-31`（板块配色：HELP 求助 = error 红、SHARE 分享 = success 绿、RECRUIT 招人 = warning 黄——"求助"用错误红制造了不必要的报警感，颜色不传达任何语义）；`StatusBadge.vue:32-37`（priority 的 HIGH 与 URGENT 同为 danger 红，"紧急"级没有独立视觉）
- **设计依据**：评审范围第 4 条"状态色是否滥用"；语义色应只表达语义，且同语义不同级别要有可辨梯度。
- **修复建议**：板块改用中性色系 + 单色分类（或用 info/accent 系列区分）；priority 给 URGENT 增加强调（如 danger 实底胶囊或 ⚠ 前缀）与 HIGH 区分。

#### 🟡-13 占位符/禁用文字对比度 3.0:1，低于 AA
- **位置**：`theme/index.ts:34`（`placeholderColor: inkTertiary #62666d`，在 surface1 输入框上实测 ≈ 3.0:1；在画布上 3.28:1）
- **问题**：全部输入框 placeholder 与禁用态文字低于 4.5:1 的 AA 线。虽业界对 placeholder 有豁免争议，但 3.0:1 在深色底上确实偏暗。
- **修复建议**：占位符提亮到 `#8b949e`（≈5.1:1）或引入 `inkTertiaryBright`；禁用态可保留低对比（disabled 豁免）。

---

### 🟢 打磨建议（细节优化）

1. **无路由过渡动画**：`App.vue:103` 的 `<RouterView />` 无 `<transition>`，页面切换生硬；深色 SaaS 一般配 150-200ms fade/slide。注意补 `prefers-reduced-motion`。（位置：`App.vue:103`）
2. **JetBrains Mono 从未加载**：`main.css:59`、`theme/index.ts:47` 引用了 `'JetBrains Mono'`，但全仓无 `@font-face`/字体 CDN 引入（`index.html` 无 font link）→ 实际回退到系统等宽。要么在 index.html 引字体，要么把注释里的"配合 JetBrains Mono"改为诚实的系统等宽栈。（位置：`apps/web/index.html`、`main.css:59`）
3. **内容区 1200px 未居中**：`App.vue:191-194` 只设 `max-width: 1200px`，宽屏下内容贴左，Linear 式布局通常是居中或全宽。补 `margin: 0 auto`。
4. **radius 越界**：`LoginView.vue:104` / `RegisterView.vue:91` 的 `.auth-card` 用 `border-radius: 10px`，不在 6/8/999 体系内；统一为 8px（radiusCard）。另 `theme/index.ts:39` 的 `borderRadiusSmall: '4px'` 在组件里几乎没被用到，可删除。
5. **Hero 页 40px/48px 字号**：`HomeView.vue:310/314`（logo 48px、标题 40px -1px 字距）超出 typeScale，作为未登录品牌落地场景可接受，但建议在 tokens 里显式声明 `display` 级（40px/600/-1px），避免"越界"与"规范"的边界模糊。
6. **通知面板交互细节**：`NotificationBell.vue:71-75` 条目可点击但无 hover 反馈、无 `cursor: pointer`、无 `aria-expanded`，点击外部不关闭，`markAll` 无 loading；面板 320px 固定宽在窄屏溢出。补 hover 态 + 关闭逻辑。
7. **AgentView 主按钮无交互态**：`AgentView.vue:259-267` `.btn-primary` 无 `cursor: pointer`、无 `:hover`、无 `:disabled` 样式（只有原生 disabled 属性）——是全站唯一"看起来像按钮但没有任何反馈"的控件；`copy-btn`（279-288）同样无 hover。
8. **顶栏 crumb 在动态路由页为空**：`router/index.ts:9-12` 只为菜单路径配了 `meta.title`，`/projects/:id`、`/posts/:id`、`/ideas/:id` 详情页的 `App.vue:88` crumb 显示空白；可加"返回列表"链接或详情页标题。
9. **身份信息双显示**：`App.vue:76-82`（侧栏底部头像+昵称+角色）与 `App.vue:91-96`（顶栏头像+昵称+下拉）冗余，同屏出现两个用户身份；建议保留顶栏下拉，侧栏底部改为版本号或收起。
10. **进度条粗细不一致**：`ProjectListView.vue:65` 用 `:height="4"`，`ProjectDetailView.vue:95` 用 `:height="6"`；统一为 4px。
11. **列表 loading 形态单一**：13 个列表页全部用居中 n-spin（`theme/index.ts:119-122` 已配好 Skeleton 主题却一处未用）；建议列表首载用 skeleton 行、刷新用小 spin，与"状态设计"成熟度匹配。
12. **空态图标与品牌字形不统一**：`EmptyState.vue:15` 默认 `◇` vs 品牌 `⬡`（`App.vue:72`、`LoginView.vue:63`），两个菱形视觉不同源；统一字形或换为 `@vicons` 图标。
13. **KPI 数字层级**：`HomeView.vue:201-208` KPI 数字 24px 与页标题同字号，弱化了"数据强调"；建议 KPI 用 28px 并给前三个数字加 `font-variant-numeric` 对齐（已有 tnum ✓）。

---

## 三、做得好的地方

- **Token 体系骨架专业**：`tokens.ts` 的 4 级表面 / 3 档 hairline / 4 档 ink / 单一强调色 / 阴影克制，结构完全符合 dark-saas 规范；`theme/index.ts` 对 Naive UI 的 common/Button/Card/Input/Select/Tag/Layout/Menu/DataTable/Modal/Popover/Dropdown/Tooltip 全覆盖，组件层几乎无裸默认样式。
- **卡片视觉语言高度统一**：20 个页面中绝大多数遵循"surface1 底 + hairline 1px 边 + 8px 圆角 + hover surface2"，间距节奏（8/10/12/14/16）跨页一致，信息密度克制、无粗阴影。
- **排版主阶梯执行到位**：`page-title 24/600/-0.4px` 在首页/详情/发帖等 6 处完全一致；`cardTitle 15px`、`meta 12px`、`.mono/.tnum` 工具类（`main.css:58-66`）使用纪律好——KPI、表格、计数全部 tabular-nums。
- **状态徽章语义化**：`StatusBadge.vue` 用映射表收敛 task/idea/project/priority 四类状态文案与颜色，避免各页自造状态标签。
- **三态覆盖率高**：13/15 个列表页有 loading（n-spin）+ EmptyState（统一组件 + CTA 引导）+ error 文案；EmptyState 文案质量高（如"去点子墙把好点子转正"）。
- **表格页风格统一**：3 个表格页（Moderation/Invites/Approvals）都是"framed 容器 + borderless 表格 + tnum 数字 + tiny 操作按钮"，是很好的可复用范式。
- **桌面端深色对比度整体达标**：正文 4 级 ink 在画布/面板上全部 ≥5:1（inkSubtle 6.15:1、inkMuted 11.8:1），语义色作为文字色全部 ≥5.6:1。
- **细节克制**：焦点环、滚动条、hover transition 0.15s、按钮 loading 态、禁用态 opacity，都是"该有的都有"，说明实现者对深色 SaaS 的克制美学有真实理解。

---

## 四、优先修复 Top 10

| # | 事项 | 级别 | 理由 | 预估工作量 | 状态 |
|---|---|---|---|---|---|
| 1 | NotificationBell 面板改用 `--cs-*` 变量（🔴-1） | 🔴 | 生产可见的透明无边框面板，最直观的视觉破损 | 0.5h | ✅ 已修复 |
| 2 | 主按钮白字对比度（🔴-2）：accent 底改深字或加深底色 | 🔴 | 全站所有 CTA 文字 2.53:1，最严重的系统性合规缺口 | 0.5h（tokens 一处 + 核对） | ✅ 已修复（方案②：实心底统一深字 `#0d1117`，primary/success/warning/error 全类） |
| 3 | 补 `--cs-hairline-subtle` 等缺失变量，消除 token 双源（🟡-2） | 🟡 | 首页行分隔、Agent 工具边框静默丢失；双源会继续漂移 | 1h（+CI 检查 0.5h） | ✅ 已修复（补变量 + StatusBadge color-mix 🟡-3 一并处理；CI 检查待建） |
| 4 | 看板/首页/两张审批表的状态三态补齐（🟡-5） | 🟡 | 加载中显示空态/0 计数，错误态冒充空态，直接误导操作 | 0.5d | ✅ 已修复（看板/首页 loading、审批/处置错误区块+重试） |
| 5 | 原生 prompt/confirm 换 n-modal/n-dialog（🟡-4） | 🟡 | 4 处系统对话框与全站深色语言割裂，核心输入无校验 | 0.5d | ✅ 已修复（看板/项目详情提交说明弹窗 + 举报弹窗 + 删除 n-dialog，测试同步） |
| 6 | 全局 `:focus-visible` + 铃铛 aria + 看板键盘替代（🟡-6） | 🟡 | 键盘用户无法操作（尤其拖拽看板），a11y 零基础 | 0.5-1d | ✅ 已修复（全局 focus 环、铃铛 aria-label/expanded、卡片「⋯」操作菜单走 move 状态机、auth 输入 aria-label） |
| 7 | 窄屏断点兜底：看板横向滚动 + KPI 2 列（🟡-1） | 🟡 | 公网站点手机打开即崩，是最低成本的可用性保障 | 0.5d | ✅ 已修复（900px 看板横滚/首页单列、640px 侧栏折叠+内容缩距、弹窗 max-width） |
| 8 | auth 页脱离应用壳 + 100dvh 居中（🟡-7） | 🟡 | 双登录入口 + 垂直错位，认证首印象破损 | 0.5d | ✅ 已修复（login/register 不渲染侧栏顶栏，content.bare 全宽 + 100dvh） |
| 9 | 菜单补图标（含折叠态）+ 示例页移出生产菜单（🟡-8/10） | 🟡 | 折叠侧栏不可辨认；生产出现调试页 | 0.5d | ✅ 已修复（@vicons/ionicons5 全菜单图标，manifest 移除 exampleUi，ExampleView 变量同步清理） |
| 10 | 字号收敛：11/10px→12px、16px→15px、22px→24px（🟡-11） | 🟡 | 排版纪律收尾，肉眼可感知的整体精致度提升 | 0.5d | ✅ 已修复（全站越界字号收敛至 typeScale） |

**顺手修复的 🟢**：内容区 1200px 居中、路由 150ms fade 过渡（含 reduced-motion）、KPI 数字 28px、进度条统一 4px、AgentView 按钮 hover/disabled、通知面板 hover/点击外部关闭、EmptyState 品牌字形 ⬡、详情页 crumb 标题、侧栏身份收敛为版本号、auth 卡片圆角 8px。

> 说明：Top 10 合计约 3-4 个工作日（含 CI 检查与回归核对）；🔴 两条可在半天内止血，建议先做。
