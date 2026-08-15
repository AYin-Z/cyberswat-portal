<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { usePageTitle } from '@/composables/usePageTitle'
usePageTitle('网络特警队')

import { departments, awards } from '@/data/team'
import { vReveal } from '@/directives/reveal'

// 首页展示荣誉精选：国际 + 国家级
const featuredAwards = computed(() =>
  awards
    .filter((a) => a.level === 'international' || a.level === 'national')
    .slice(0, 8)
)

// 开发部协作平台（已上线子站）——主站→子站入口
const devSite = { url: 'https://dev.cyberswat.cn' }

// 部门状态（SOC 面板用；后续接后端数据源）
const deptStatus: Record<string, 'ACTIVE' | 'IDLE' | 'STANDBY'> = {
  attack: 'ACTIVE',
  forensics: 'ACTIVE',
  modeling: 'ACTIVE',
  algorithm: 'STANDBY',
  bigdata: 'ACTIVE',
  dev: 'ACTIVE',
  ai: 'ACTIVE',
  pr: 'ACTIVE',
}

// 部门 meta 展示（等宽字体标签，简短）
const deptMeta: Record<string, string> = {
  attack: '0psu3 · WMCTF #3',
  forensics: '406取证人 · 盘古石杯冠军',
  modeling: '2025 美赛国际一等奖',
  algorithm: '蓝桥杯 · 百度之星',
  bigdata: '智警杯主力',
  dev: '平台工程化',
  ai: '警务场景 AI',
  pr: '品牌 · 内容',
}

const stats = [
  { num: 12, suffix: '项', label: '国家级奖项', key: 'national' },
  { num: 20, suffix: '+', label: '省部级奖项', key: 'provincial' },
  { num: 8, suffix: '个', label: '作战部门', key: 'depts' },
  { num: 3, suffix: 'rd', label: 'WMCTF 2025 全球', key: 'wmctf' },
]

// —— 数字滚动 ——
const statRefs = ref<(HTMLDivElement | null)[]>([])
const displayed = ref(stats.map(() => 0))
let observer: IntersectionObserver | null = null
let raf = 0

function animateCount(index: number, target: number) {
  const duration = 1200
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    displayed.value[index] = Math.round(target * eased)
    if (p < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number((entry.target as HTMLElement).dataset.idx)
          if (!Number.isNaN(idx)) animateCount(idx, stats[idx].num)
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.4 }
  )
  statRefs.value.forEach((el) => el && observer?.observe(el))
})

onUnmounted(() => {
  observer?.disconnect()
  cancelAnimationFrame(raf)
})

// 顶部状态条时间
const now = ref('')
let timer = 0
function tickTime() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  now.value = `[ ${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ]`
}
onMounted(() => {
  tickTime()
  timer = window.setInterval(tickTime, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="home">
    <!-- 系统状态条 -->
    <div class="topbar">
      <span class="sys">CYBERSWAT // NETSWAT</span>
      <span class="status-line"><span class="dot"></span>ALL SYSTEMS NOMINAL</span>
      <span class="time">{{ now }}</span>
    </div>

    <!-- Hero -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-left">
          <div class="terminal-line" v-reveal>
            <span class="prompt">$</span>
            <span class="cmd">./cyberswat --status</span>
            <span class="cursor"></span>
          </div>
          <h1 class="hero-title" v-reveal>
            <span class="title-cn">赛博蓝盾</span>
            <span class="title-en">CYBERSWAT</span>
          </h1>
          <p class="hero-sub" v-reveal>
            网络特警队。<b>政治建警，科技兴警</b>——<br />
            一支为网络空间安全而生的网安卫士队伍。
          </p>
          <div class="hero-actions" v-reveal>
            <RouterLink to="/about" class="btn btn-primary">了解队伍</RouterLink>
            <RouterLink to="/honors" class="btn">荣誉墙 →</RouterLink>
          </div>
        </div>

        <div class="hero-right" v-reveal>
          <div class="panel-head">
            <span class="tag">FIELD REPORT</span>
            <span>2023-2025</span>
          </div>
          <div class="stats-grid">
            <div
              v-for="(s, i) in stats"
              :key="s.key"
              class="stat"
              :ref="(el) => (statRefs[i] = el as HTMLDivElement | null)"
              :data-idx="i"
            >
              <div class="num">{{ displayed[i] }}<small>{{ s.suffix }}</small></div>
              <div class="label">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 部门矩阵 -->
    <section class="depts">
      <div class="container">
        <div class="section-label" v-reveal>DEPARTMENTS // 八大部门</div>
        <div class="dept-grid" v-reveal>
          <!-- 部门卡片：dev 部门外链到已上线的协作平台子站 -->
          <a
            v-if="devSite"
            :href="devSite.url"
            target="_blank"
            rel="noopener"
            class="dept live"
          >
            <div class="idx">04</div>
            <div class="name">开发部</div>
            <div class="en">Development</div>
            <div class="meta">
              <span>协作平台已上线</span>
              <span class="status">
                <span class="dot live-dot"></span>
                LIVE
              </span>
            </div>
          </a>
          <RouterLink
            v-for="(d, i) in departments.filter((x) => x.slug !== 'dev')"
            :key="d.slug"
            :to="`/departments/${d.slug}`"
            class="dept"
          >
            <div class="idx">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="name">{{ d.name }}</div>
            <div class="en">{{ d.en }}</div>
            <div class="meta">
              <span>{{ deptMeta[d.slug] }}</span>
              <span class="status">
                <span class="dot" :class="{ warn: deptStatus[d.slug] !== 'ACTIVE' }"></span>
                {{ deptStatus[d.slug] }}
              </span>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 荣誉精选 -->
    <section class="honors">
      <div class="container">
        <div class="section-head" v-reveal>
          <div class="section-label">ACHIEVEMENTS // 荣誉精选</div>
          <RouterLink to="/honors" class="section-more">全部荣誉 →</RouterLink>
        </div>
        <div class="honor-grid">
          <div v-for="a in featuredAwards" :key="a.id" class="honor" v-reveal>
            <span class="honor-year">{{ a.year }}</span>
            <p class="honor-event">{{ a.event }}</p>
            <p class="honor-result">{{ a.result }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ===== 系统状态条 ===== */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  padding: 10px 28px;
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--text-dim);
  letter-spacing: 0.06em;
}
.topbar .sys {
  color: var(--accent-bright);
}
.topbar .status-line {
  display: flex;
  align-items: center;
  gap: 8px;
}
.topbar .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 6px rgba(63, 185, 80, 0.6);
  animation: pulse 2s infinite;
}
.topbar .time {
  color: var(--text-faint);
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

/* ===== Hero ===== */
.hero {
  padding: 96px 0 72px;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 55% 45% at 78% 0%, rgba(76, 201, 240, 0.05), transparent),
    radial-gradient(ellipse 40% 30% at 15% 5%, rgba(59, 130, 246, 0.04), transparent);
}

.hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 72px;
  align-items: start;
}

/* 终端行 */
.terminal-line {
  font-family: var(--font-display);
  font-size: 13px;
  color: var(--text-faint);
  margin-bottom: 28px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.terminal-line .prompt {
  color: var(--accent-bright);
}
.terminal-line .cmd {
  color: var(--text-dim);
}
.terminal-line .cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background: var(--accent-bright);
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* 标题 */
.hero-title {
  margin-bottom: 20px;
}
.title-cn {
  font-size: clamp(44px, 6.5vw, 64px);
  font-weight: 900;
  letter-spacing: 0.02em;
  line-height: 1.12;
  color: var(--text);
}
.title-en {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(16px, 2.2vw, 22px);
  font-weight: 500;
  letter-spacing: 0.22em;
  color: var(--accent-bright);
  margin-top: 14px;
}

.hero-sub {
  font-size: 16px;
  color: var(--text-dim);
  line-height: 1.9;
  max-width: 480px;
  margin-bottom: 40px;
}
.hero-sub b {
  color: var(--text);
  font-weight: 500;
}

/* 按钮（硬边框，无圆角） */
.hero-actions {
  display: flex;
  gap: 14px;
}
.btn {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.08em;
  padding: 12px 26px;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition:
    border-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease),
    background var(--dur-fast) var(--ease);
}
.btn:hover {
  border-color: var(--accent-bright);
  color: var(--accent-bright);
}
.btn-primary {
  background: var(--accent-bright);
  border-color: var(--accent-bright);
  color: #06121a;
  font-weight: 700;
}
.btn-primary:hover {
  background: transparent;
  color: var(--accent-bright);
}

/* 右侧 FIELD REPORT 面板 */
.hero-right {
  border: 1px solid var(--border);
  background: var(--bg-card);
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-display);
  font-size: 11px;
  color: var(--text-faint);
  letter-spacing: 0.12em;
}
.panel-head .tag {
  color: var(--accent-bright);
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.stat {
  padding: 22px 18px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.stat:nth-child(2n) {
  border-right: none;
}
.stat:nth-last-child(-n + 2) {
  border-bottom: none;
}
.stat .num {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.stat .num small {
  font-size: 18px;
  color: var(--accent-bright);
}
.stat .label {
  font-size: 12px;
  color: var(--text-faint);
  margin-top: 6px;
  letter-spacing: 0.08em;
}

/* ===== 部门矩阵 ===== */
.depts {
  padding: 48px 0 88px;
}
.section-label {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--text-faint);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-label::before {
  content: '';
  width: 26px;
  height: 1px;
  background: var(--accent-bright);
}

.dept-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--border);
  background: var(--bg-card);
}
.dept {
  padding: 20px 18px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: background var(--dur-fast) var(--ease);
}
.dept.live {
  position: relative;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), transparent 60%);
}
.dept.live::after {
  content: '↗';
  position: absolute;
  top: 12px;
  right: 14px;
  color: var(--accent-bright);
  font-family: var(--font-display);
  font-size: 14px;
}
.dept .live-dot {
  background: var(--accent-bright);
  box-shadow: 0 0 6px rgba(96, 165, 250, 0.7);
}
.dept:nth-child(4n) {
  border-right: none;
}
.dept:nth-last-child(-n + 4) {
  border-bottom: none;
}
.dept:hover {
  background: var(--bg-hover);
}
.dept .idx {
  font-family: var(--font-display);
  font-size: 11px;
  color: var(--text-faint);
  letter-spacing: 0.1em;
}
.dept .name {
  font-size: 16px;
  font-weight: 700;
  margin: 10px 0 4px;
  color: var(--text);
}
.dept .en {
  font-family: var(--font-display);
  font-size: 10px;
  color: var(--accent-bright);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.dept .meta {
  font-family: var(--font-display);
  font-size: 11px;
  color: var(--text-faint);
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dept .status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
}
.dept .status .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
}
.dept .status .dot.warn {
  background: var(--warning);
}

/* ===== 荣誉 ===== */
.honors {
  padding: 0 0 96px;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.section-head .section-label {
  margin-bottom: 0;
}
.section-more {
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--text-dim);
  text-decoration: none;
  letter-spacing: 0.06em;
}
.section-more:hover {
  color: var(--accent-bright);
}

.honor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--border);
  background: var(--bg-card);
}
.honor {
  padding: 18px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  transition: background var(--dur-fast) var(--ease);
}
.honor:nth-child(4n) {
  border-right: none;
}
.honor:nth-last-child(-n + 4) {
  border-bottom: none;
}
.honor:hover {
  background: var(--bg-hover);
}
.honor-year {
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--gold);
}
.honor-event {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}
.honor-result {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-dim);
}

/* ===== Responsive ===== */
@media (max-width: 1000px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .dept-grid,
  .honor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .dept:nth-child(4n),
  .honor:nth-child(4n) {
    border-right: 1px solid var(--border);
  }
  .dept:nth-child(2n),
  .honor:nth-child(2n) {
    border-right: none;
  }
  .dept:nth-last-child(-n + 4),
  .honor:nth-last-child(-n + 4) {
    border-bottom: 1px solid var(--border);
  }
  .dept:nth-last-child(-n + 2),
  .honor:nth-last-child(-n + 2) {
    border-bottom: none;
  }
}

@media (max-width: 640px) {
  .topbar .status-line {
    display: none;
  }
  .hero {
    padding: 64px 0 56px;
  }
  .depts {
    padding: 32px 0 64px;
  }
  .honors {
    padding: 0 0 64px;
  }
  .dept-grid,
  .honor-grid {
    grid-template-columns: 1fr;
  }
  .dept,
  .honor {
    border-right: none;
  }
  .dept:nth-last-child(-n + 2),
  .honor:nth-last-child(-n + 2) {
    border-bottom: 1px solid var(--border);
  }
  .dept:last-child,
  .honor:last-child {
    border-bottom: none;
  }
}
</style>
