# 移动端 / 触屏适配评审报告 — CyberSWAT 开发部子站（dev.cyberswat.cn）

> **修复状态（2026-08-16）**：✅ **Top 10 已全部修复并上线**（详见 §三 状态列），前端测试 67/67 全绿。

> 评审对象：`apps/web/src` 全部视图 + App.vue 布局壳 + assets/main.css（HEAD `3c1a183`）
> 评审性质：移动端/触屏「顺手程度」专项 —— 不是功能评审，也不是桌面设计评审
> 评审视角：375px 主流手机（iPhone 12/13/14 系列）、≤400px 小屏、横屏；iOS Safari 为主、Android Chrome 次之
> 方法：逐文件通读 + grep 证据检索（@media / font-size / white-space / width / 100vh / safe-area / :active / size="tiny" / touch-action）+ naive-ui 2.44.1 源码核验默认尺寸与布局结构

---

## 评分与总评

**移动端体验成熟度：58 / 100**（及格线上下：骨架兜底已就位、无致命白屏，但主要操作流程在手机上不顺手）

**一句话总评**：上一轮的断点/弹窗/横滚兜底都真实生效了，但「三张数据表格页在手机上操作列被裁剪、全站输入框聚焦即被 iOS 放大、侧栏展开挤占 60% 屏宽、全站没有按压反馈」这四件事，让手机上的核心流程（审批 / 处置 / 邀请 / 发帖 / 任务流转）远称不上「顺手」。

**最影响顺手度的 3 件事**：
1. **三张 NDataTable 页（审批/处置/邀请）在 ≤768px 时右侧列被 `overflow:hidden` 裁剪、且不可滚动** —— 部长在手机上的高频操作（批准/驳回/删除/撤销）直接不可达（🔴）。
2. **全站所有输入框字号 14px**（原生 + naive-ui 默认），iOS Safari 聚焦即强制页面放大，每个表单页每点一个输入框页面就「跳」一下（🔴）。
3. **侧栏在手机上仍是展开式（push）220px**，375px 下展开即挤占 60% 屏宽，无抽屉遮罩、点完菜单不自动收起，误触展开后内容区只剩 155px（🟡，接近 🔴）。

---

## 一、已就位的基础（核验上一轮 3c1a183 修复，避免重复报告）

以下各项均已逐条核对源码，确认真实生效：

| # | 兜底 | 证据 |
|---|------|------|
| 1 | viewport meta 正确（`width=device-width, initial-scale=1.0`，未禁用缩放） | `index.html:5` |
| 2 | 窄屏侧栏自动折叠为 64px 图标栏（阈值 768px，非任务描述中的 640px） | `App.vue:35-39`（`window.innerWidth < 768`）、`App.vue:96-97`（`:collapsed-width="64"`） |
| 3 | HomeView ≤900px：KPI 4→2 列、双栏改单列 | `HomeView.vue:310-317` |
| 4 | TaskBoard ≤900px：看板改横向滚动、列 260px、scroll-snap | `TaskBoardView.vue:406-418`（`scroll-snap-type: x proximity` + `scroll-snap-align: start`） |
| 5 | 弹窗窄屏 `max-width: calc(100vw - 32px)` | `TaskBoardView.vue:256,281`、`ProjectDetailView.vue:158`、`PostDetailView.vue:160` |
| 6 | 内容区 ≤640px 缩距 16px；body 字号 13px | `App.vue:249-253`、`assets/main.css:67-71` |
| 7 | 认证页用 `100dvh`（避免 iOS 地址栏遮挡） | `LoginView.vue:93`、`RegisterView.vue:80` |
| 8 | 卡片类页面用 `auto-fill minmax()` 网格自适应（无需断点） | `MembersView.vue:99`（200px）、`IdeaListView.vue:112`（280px）、`ProjectListView.vue:91`（300px） |
| 9 | 长文本统一 ellipsis，无页面级横向溢出 | `HomeView.vue:267-281`、`PostListView.vue:140-147`、`AnnouncementListView.vue:152-160`、`NotificationBell.vue:108` |
| 10 | 看板卡片「⋯」操作按钮常显（非 hover-only），触屏可用 | `TaskBoardView.vue:239-241`（始终渲染，`:hover` 仅为增强） |
| 11 | 菜单项全部带 ionicons 图标，折叠态可辨认 | `App.vue:12-22`（iconMap）、`App.vue:108` |

> 注：任务描述称「640px 侧栏自动折叠」，代码实际是 768px（`App.vue:37`）。768 阈值本身合理（iPad 竖屏也折叠），仅与内容缩距断点 640 不一致，见 🟢-19。

---

## 二、问题清单

### 🔴 移动端明显破损 / 不可用

**🔴-1 三张数据表格页在窄屏被裁剪，操作列（核心功能）不可达**
- 位置：`ApprovalsView.vue:49-87`（列宽 180+130+150+150=610px，`ApprovalsView.vue:53,59,74,80`）、`ModerationView.vue:54-84`（70+120+150+140=480px，`ModerationView.vue:58,64,71,77`）、`InvitesView.vue:74-125`（100+90+80+150+150+80=650px，`InvitesView.vue:78,85,97,103,109,115`）；三页均给表格根节点 `.table { overflow: hidden }`（`ApprovalsView.vue:133-138`、`ModerationView.vue:130-135`、`InvitesView.vue:194-199`）
- 问题：三页均未传 `scroll-x`，naive-ui 走「基本表格」布局（`use-scroll.mjs` 中 `explicitlyScrollableRef` 仅在 `scrollX/maxHeight/flexHeight` 设置时成立），表格实际宽度 = 列宽之和（610/480/650px），375px 手机上内容区约 343px，超出部分被 `.table { overflow:hidden }` 直接裁掉、**且没有任何横向滚动**——「操作」列（批准/驳回、删除内容/忽略、撤销）整个不可见、不可达。桌面 1200px 内容区能容纳所以未被发现。
- 设计依据：这三页是部长/管理员的**核心操作页**，操作按钮是页面存在的意义；手机上看不到操作列 = 页面功能性报废。即使能横滚，naive-ui 在滚动模式下还给表头 `scrollbar-width:none` 隐藏滚动条（node_modules `data-table/src/styles/index.cssr.mjs` 361-365 行），触屏上毫无发现性。
- 修复建议：≤768px 时将这三页改为**卡片列表渲染**（每条一行卡片，操作按钮平铺在行尾）；或退一步：`scroll-x` 横向滚动 + 左侧操作列 `position: sticky` + 可见滚动条/边缘渐隐提示。同时把操作按钮从 `size="tiny"`（22px）升为 ≥40px。

**🔴-2 全站输入框字号 14px，iOS 聚焦即强制放大页面**
- 位置：原生输入 `LoginView.vue:145-154`（`.form input { font-size: 14px }`）、`RegisterView.vue:137-146`（同）；naive-ui 全部 NInput/NSelect/NDatePicker/textarea 走默认 `fontSizeMedium: '14px'`（node_modules `naive-ui/es/_styles/common/_common.mjs`：`fontSize: '14px'` / `fontSizeMedium: '14px'`），`theme/index.ts` 的 Input/Select 覆盖只改颜色边框，**未改字号**；全局基线 `assets/main.css:41`（14px）与窄屏 13px（`main.css:69`）均 <16px
- 问题：iOS Safari 对聚焦时 `font-size < 16px` 的 input/select/textarea 自动放大页面（并保持放大状态直到手动缩小）。影响面=全站所有表单页：登录/注册/发帖/点子/公告/评论框/点子加入/任务弹窗/提交说明弹窗/资料编辑。每点一个输入框页面就跳变一次，输入完还要手动缩回——移动端最破坏「顺手」的单点问题。
- 设计依据：iOS Safari 明确行为（16px 阈值），Apple HIG 亦建议表单字号 ≥16px 以禁用自动缩放。
- 修复建议：全局加 `@media (max-width: 768px) { input, select, textarea, .n-input__input-el, .n-input textarea, .n-base-selection-input { font-size: 16px !important } }`（只在小屏放大，桌面不受影响）。

**🔴-3 `.shell` 用 `100vh` 且页面在内部滚动容器中滚动，iOS 底部内容可能被地址栏区域遮挡**
- 位置：`App.vue:146-148`（`.shell { height: 100vh }`）；滚动结构：naive-ui NLayout 把全部插槽包进 `.n-layout-scroll-container`（node_modules `naive-ui/es/layout/src/Layout.mjs:132`，CSS 为 `overflow-x:hidden; height:100%`，`overflow-y` 按规范从 visible 计算为 auto），即**页面滚动发生在内层 div，window 不滚动**；认证页已正确使用 `100dvh`（`LoginView.vue:93`、`RegisterView.vue:80`）
- 问题：iOS Safari 在「window 不滚动、内层 div 滚动」时地址栏不会自动收起；`100vh` = 地址栏展开时的小视口高度，容器底边正好落在可见区域外，**底部约 50-56px（末条列表项、表单提交按钮、sider 触发条）可能无法滚动到达**。（推测：内滚容器 + 地址栏行为的组合需真机验证，但 `100vh vs 100dvh` 的差异是确定的。）
- 设计依据：`dvh` 专为移动端动态视口设计；同页 auth 已示范正确写法。
- 修复建议：`.shell { height: 100dvh }`（一行，兜底 `100vh` 写在前）。

### 🟡 重要：不顺手、体验破损

**🟡-4 侧栏在手机上是展开式（push）220px，无抽屉遮罩、选中后不自动收起**
- 位置：`App.vue:93-113`（`:width="220"` + `:collapsed-width="64"` + `show-trigger="bar"`）；naive-ui sider 默认 `position: static` 在流内（node_modules `layout-sider.cssr.mjs`：`position: relative`），展开即把内容区推开而非覆盖
- 问题：375px 手机上：折叠态 64px 已占 ~17% 屏宽（可用但偏宽）；一旦误触底部的 bar 触发器展开为 220px，内容区被挤到 **155px**，列表/表格/表单全部无法使用，且**点完菜单项不会自动收起**——用户必须再去找屏幕左下角的细条触发器手动折叠。这是移动端导航流程的「雪崩点」。
- 依据：移动端抽屉模式（overlay + 遮罩 + 点击遮罩/选中菜单即收起）是通行模式（Material Navigation Drawer 规范）。
- 修复建议：≤768px 时 `n-layout-sider position="absolute"`（naive 支持）+ 半透明遮罩 + `onUpdateValue`/路由 afterEach 中自动 `collapsed=true`；折叠宽度可进一步收到 56px。

**🟡-5 全站无 `:active` 按压反馈（触屏上按钮/列表行「按下去没反应」）**
- 位置：grep 全仓 `:active` **0 命中**；所有交互只有 `:hover`：`HomeView.vue:264-266`（.row）、`PostListView.vue:127-130`（.item）、`AnnouncementListView.vue:139-142`（.item）、`NotificationBell.vue:104`（.item）、`TaskBoardView.vue:352-354`（.card）、`MembersView.vue:110-113`、`AgentView.vue:271-273` 等
- 问题：触屏设备没有 hover 态，按压与松开之间没有任何视觉反馈（仅 iOS 默认灰色高亮一闪），用户会感觉按钮「没响应」「卡顿」。
- 修复建议：main.css 加全局 `:active` 规则（如 `transform: translateY(0.5px)` + `background: var(--cs-surface-3)` 或 `opacity: 0.85`），对 button/a/可点 div 生效。

**🟡-6 触控目标普遍 <44px（Apple HIG）/ <40px 底线**
- naive-ui 默认高度（node_modules `naive-ui/es/_styles/common/_common.mjs`）：`heightTiny: '22px'`、`heightSmall: '28px'`、`heightMedium: '34px'`；`theme/index.ts` 未覆盖 Button 高度
- 点名的不足目标：
  - `size="tiny"`（22px）：`ApprovalsView.vue:83-84`（批准/驳回）、`ModerationView.vue:80-81`（删除内容/忽略）、`InvitesView.vue:121`（撤销）、`ProjectDetailView.vue:146-150`（认领/提交验收/通过/驳回）、`PostListView.vue:62-71`（板块筛选按钮）
  - `size="small"`（28px）：`App.vue:122-127`（用户菜单/登录按钮）、`InvitesView.vue:136-137`（邀请成员/干部）、`PostDetailView.vue:121-133`（👍/举报/删除）、`TaskBoardView.vue:196`（新任务）、`ProfileView.vue:129-130,151-155`（添加/删/＋添加外链）
  - 自定义更小：`TaskBoardView.vue:239-241` + `390-399` `.card-more`（padding 0 4px，约 20×20px）；`NotificationBell.vue:75-77` `.bell`（无 padding，约 20×20px）、`:81`+`:101` `.clear`「全部已读」（约 18px 高）；`AnnouncementListView.vue:94-103` `.confirm-btn`（padding 2px 10px，约 22px 高）；`AgentView.vue:289-299` `.copy-btn`（padding 4px 14px，约 26px 高）；`HomeView.vue:187-191` `.quick` 链接（约 18px 行高）
- 依据：Apple HIG 最小 44×44pt、Material 48dp、WCAG 2.5.5（AA，24px）——「批准/驳回/删除」这类高频且不可逆的操作尤其不该 22px。
- 修复建议：主题层统一（`theme/index.ts` Button 加高度覆盖或全局 `button, .n-button { min-height: 40px }` 于 ≤768px）；自定义小按钮补 padding/`min-width: 44px`。

**🟡-7 看板卡片触屏拖拽与页面滚动冲突风险**
- 位置：`TaskBoardView.vue:211-227`（vue-draggable-next，未传 `:delay` / `:touch-start-threshold`）、`:406-418`（看板容器横向滚动）；Sortable 1.15.7 在 `_onTouchMove` 中无条件 `evt.preventDefault()`（node_modules `sortablejs/.../sortable.esm.js:1507`），且以非 passive 绑定 touchmove
- 问题：手指按住卡片上下滑动（用户想滚页面）时，移动超过阈值即被判为拖拽并 `preventDefault` → **页面滚动被吞、卡片被拖走**；反之想在触屏上完成跨列拖拽（列与列之间还要横滚看板）也容易误触。默认 `delay:0` 没有任何触屏防误触。（推测：需真机验证具体体感，但 Sortable 的 touch 行为是确定的。）
- 修复建议：触屏下给 draggable 传 `:delay="150"` `:touch-start-threshold="5"`，并给 `.card` 加 `touch-action: manipulation`；跨列移动在手机上更多依赖 🟡-4 旁的「⋯」菜单（`cardActions`，`TaskBoardView.vue:74-84`）流转即可。

**🟡-8 AgentView 双栏布局在 ≤768px 过挤（唯一没有窄屏策略的网格页）**
- 位置：`AgentView.vue:232-235`（`.grid { grid-template-columns: 1fr 1fr }`，无任何 @media）；`AgentView.vue:229-303` 相关面板样式
- 问题：375px 下每栏仅约 165px：② 配置面板（pre 代码）与 ③ 工具列表文字被压成细窄列、`AgentView.vue:309-326` `.tool` 行内 `t-id` + `t-desc` 挤压换行；`copy-btn` 又小（🟡-6）。
- 修复建议：`@media (max-width: 768px) { .grid { grid-template-columns: 1fr } }`（一行）。

**🟡-9 横滑区域无发现性（discoverability）**
- 位置：`TaskBoardView.vue:406-418`（看板横滚，有 scroll-snap 但无提示）；三张表（🔴-1）即使修好横滚，naive-ui 滚动模式表头 `scrollbar-width:none` 隐藏滚动条（`data-table/src/styles/index.cssr.mjs:364-367`）
- 问题：触屏上滚动条天然隐藏，没有任何视觉暗示「这里还能左右滑」——用户以为只有一列。
- 修复建议：横滚容器加右侧渐隐遮罩（`mask-image: linear-gradient(...)`）或顶部一行「← 左右滑动查看 →」提示；表格页建议直接卡片化（🔴-1）。

**🟡-10 顶栏与侧栏随内容一起滚动消失，移动端没有固定导航/返回入口**
- 位置：`App.vue:91-139` 结构；naive-ui NLayout 的 `.n-layout-scroll-container` 包裹 sider+header+content 整体（`Layout.mjs:132`），sider `position: relative`（`layout-sider.cssr.mjs`）——**没有 sticky 顶栏、没有固定侧栏**，往下滚动时通知铃铛、用户菜单、侧栏菜单全部滚出视口
- 问题：移动端滚动长列表（社区/公告/看板）后，唯一回顶/导航方式是手动滚回顶部；无返回按钮、无「回到顶部」FAB；通知入口（bell）随之消失。
- 修复建议：`n-layout-header` 加 `position: sticky; top: 0`（内部滚动容器内 sticky 生效）；或移动端加底部 tab 栏/浮动返回按钮。

**🟡-11 ProfileView 外链行在 375px 逼近溢出**
- 位置：`ProfileView.vue:218-228`（`.link-row` = 固定 `l-label 120px` + 弹性 `l-url` + 「删」按钮）、`:151-153`（三个 size=small 控件）
- 问题：343px 内容宽下 120+8+url+8+28px 按钮 ≈ 314px，已贴近上限；URL 输入框被挤到 ~160px，长 URL 编辑困难；「删」按钮 28px 且紧贴右缘易误触相邻行。
- 修复建议：≤640px 时 label 缩到 90px 或改两行堆叠。

### 🟢 打磨项

**🟢-12 `HomeView.vue:187-191`** `.quick` 三个快捷链接（＋发点子/新任务/发帖）是 13px 无 padding 的文本链接，热区约 18px 高 → 补 `padding: 8px 4px`（行内热区放大）。
**🟢-13 `HomeView.vue:333-338`** hero-title 40px，375px 下「CYBERSWAT·DEV」会折行（可接受，但建议 ≤400px 降到 32-34px 保持单行品牌感）。
**🟢-14 `EmptyState.vue:44-51`** `.cta` 高约 32px（padding 6px 16px）→ 加 padding 到 10px 16px。
**🟢-15 `LoginView.vue:159-166` / `RegisterView.vue:154-160`** `.btn` 高约 41px（10px 上下 padding + 14px 字号）——接近 44px 但未达，建议 padding 12px。
**🟢-16 safe-area 未处理**：grep `safe-area|viewport-fit` 全仓 0 命中，`index.html` 无 `viewport-fit=cover`。当前浏览器视口默认落在安全区内、且全站无固定底栏，**实际无遮挡**；但若后续加 `viewport-fit=cover` 或底部固定 UI（如 🟡-10 的 tab 栏），需同步补 `env(safe-area-inset-bottom)`。
**🟢-17 `App.vue:118`（.crumb）/ `:124`（.nick）** 顶栏标题与昵称均无截断：标题短（1-4 字）无碍，长昵称（>6 字）会挤压 crumb（推测）；建议 `.crumb { flex:1; min-width:0; ellipsis }`。
**🟢-18 断点不一致**：折叠阈值 768（`App.vue:37`）vs 内容缩距阈值 640（`App.vue:249`）——640-768px 区间侧栏已折叠但内容仍 24px 内边距；可统一为 768。
**🟢-19 未定制 `-webkit-tap-highlight-color`**：iOS 点击闪烁默认灰色，配合全站无 `:active`（🟡-5）观感生硬；建议 `-webkit-tap-highlight-color: transparent` + 补按压态。
**🟢-20 内滚容器 + 键盘**：页面在内层滚动容器中滚动（🔴-3 同因），iOS 键盘弹起时聚焦输入框是否自动滚入视野存在不确定性（推测需真机验证）；若出现遮挡，需在 focus 时手动 `scrollIntoView`。当前表单提交按钮均为流内非 sticky，正常可滚达，主要风险仍是 🔴-2 的缩放。

---

## 三、优先修复 Top 10

| # | 事项 | 级别 | 理由 | 预估工作量 | 状态 |
|---|------|------|------|-----------|------|
| 1 | 三张 NDataTable 页（审批/处置/邀请）窄屏卡片化或可滚动 + 操作列可达 | 🔴 | 核心管理操作在手机不可达，功能性报废 | 中 | ✅ 已修复（`:scroll-x` 横滚 + 操作列 `fixed:'right'` 常驻 + 容器 `overflow-x:auto` + 操作按钮 small/≥40px） |
| 2 | 全站输入框 ≤768px 字号升 16px（禁 iOS 聚焦放大） | 🔴 | 所有表单页每聚焦一次就跳变，最普遍的「不顺手」 | 极小 | ✅ 已修复（main.css @media 覆盖原生+naive 输入） |
| 3 | `.shell` 100vh → 100dvh | 🔴 | iOS 底部内容可能不可达（推测需真机复核） | 极小 | ✅ 已修复（100vh 前置兜底 + 100dvh） |
| 4 | 侧栏移动端改抽屉（absolute + 遮罩 + 选中自动收起） | 🟡 | 375px 展开挤占 60% 屏宽、误触即雪崩 | 中 | ✅ 已修复（折叠 56px 常驻 sticky + 展开 absolute 抽屉 + 遮罩点击收起 + 路由切换自动收起） |
| 5 | 全站补 `:active` 按压反馈 | 🟡 | 触屏无 hover，按压无响应体感 | 小 | ✅ 已修复（`@media (hover:none)` 全局 active 态 + tap-highlight 清除） |
| 6 | 触控目标 ≥40-44px（tiny/small 按钮、card-more、bell、clear、confirm-btn、copy-btn、quick 链接） | 🟡 | 高频且不可逆操作 22px 极易误触 | 小-中 | ✅ 已修复（naive tiny/small 全局 min-height 40px + 各自定义控件 padding/尺寸） |
| 7 | 看板触屏拖拽防冲突（delay/touchStartThreshold/touch-action） | 🟡 | 触屏滑动页面被吞成拖拽，跨列拖拽难用 | 小 | ✅ 已修复（`:delay=150` `:touch-start-threshold=5` + `.card { touch-action: manipulation }`） |
| 8 | AgentView `.grid` ≤768px 单列 | 🟡 | 375px 双栏过挤、配置/工具不可读 | 极小 | ✅ 已修复 |
| 9 | 横滑发现性（看板/表格边缘渐隐 + 提示文案） | 🟡 | 触屏隐藏滚动条，用户不知道能左右滑 | 小 | ✅ 已修复（看板右缘 mask 渐隐；表格靠 fixed 操作列+横滚） |
| 10 | 固定顶栏/侧栏（sticky）+ 移动端返回/顶部入口 | 🟡 | 滚动后导航与通知入口全部消失 | 中 | ✅ 已修复（顶栏 sticky 常驻 bell/用户菜单；侧栏折叠态 sticky 导航锚点） |

**顺手修复的 🟢**：断点统一 768、hero 超窄屏 32px、quick 链接/CTA/auth 按钮热区、crumb 长昵称不挤压、ProfileView 外链行窄屏堆叠、safe-area 预留注释。

---

## 四、评审备注

- 未评审功能逻辑（已有专门轮次）；本报告只覆盖移动端适配与触屏体验。
- 「推测」标注处：🔴-3（iOS 地址栏行为组合）、🟡-7（触屏拖拽体感）、🟢-17/🟢-20（长昵称挤压、键盘遮挡）——均为代码结构上成立的推断，建议以真机（iPhone Safari + Android Chrome）复核一次。
- naive-ui 尺寸与结构结论均来自 node_modules 内 2.44.1 源码（`_common.mjs`、`Layout.mjs`、`layout-sider.cssr.mjs`、`data-table/src/styles/index.cssr.mjs`、`sortable.esm.js`），非猜测。
- 桌面端结论不做评审；本报告引用的桌面现象（如表格在桌面正常）仅用于解释移动端差异成因。
