<script setup lang="ts">
import { computed } from 'vue'
import { departments, awards } from '@/data/team'
import { vReveal } from '@/directives/reveal'

// 首页展示荣誉精选：国际 + 国家级
const featuredAwards = computed(() =>
  awards
    .filter((a) => a.level === 'international' || a.level === 'national')
    .slice(0, 8)
)

const stats = [
  { num: '12', label: '国家级奖项' },
  { num: '20+', label: '省部级奖项' },
  { num: '8', label: '部门' },
  { num: '2022', label: '成立' },
]
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-grid"></div>
      <div class="container hero-inner">
        <p class="hero-eyebrow" v-reveal>CYBERSWAT · PPSUC</p>
        <h1 class="hero-title" v-reveal>
          <span class="title-cn">赛博蓝盾</span>
          <span class="title-en">CyberSWAT</span>
        </h1>
        <p class="hero-sub" v-reveal>
          中国人民公安大学网络特警队 —— 政治建警，科技兴警。<br />
          一支以网络空间安全为使命的预备警官队伍。
        </p>
        <div class="hero-actions" v-reveal>
          <RouterLink to="/about" class="btn btn-primary">了解队伍</RouterLink>
          <RouterLink to="/honors" class="btn btn-ghost">荣誉墙 →</RouterLink>
        </div>
      </div>
    </section>

    <!-- 数据亮点 -->
    <section class="stats">
      <div class="container stats-grid">
        <div v-for="s in stats" :key="s.label" class="stat" v-reveal>
          <p class="stat-num">{{ s.num }}</p>
          <p class="stat-label">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- 社团介绍 -->
    <section class="about container">
      <div class="section-head" v-reveal>
        <p class="section-tag">ABOUT</p>
        <h2 class="section-title">网络空间安全的实战化平台</h2>
      </div>
      <div class="about-body" v-reveal>
        <p>
          网络特警队成立于 <strong>2022 年 4 月</strong>，前身为信息网络安全学院 2014
          年成立的院级社团，现由校团委指导，信息网络安全学院副院长高见担任指导老师。
        </p>
        <p>
          队伍下设攻防、取证、建模、算法、大数据、开发、人工智能、宣传办公室
          <strong>八大部门</strong>，践行「理论与实战融合、教学与竞赛并重」的培养模式，
          活跃于全国各类高水平赛事舞台。
        </p>
      </div>
    </section>

    <!-- 部门入口 -->
    <section class="depts container">
      <div class="section-head" v-reveal>
        <p class="section-tag">DEPARTMENTS</p>
        <h2 class="section-title">八大部门</h2>
      </div>
      <div class="dept-grid">
        <RouterLink
          v-for="(d, i) in departments"
          :key="d.slug"
          :to="`/departments/${d.slug}`"
          class="dept-card"
          v-reveal
          :style="{ '--i': i }"
        >
          <p class="dept-idx">{{ String(i + 1).padStart(2, '0') }}</p>
          <h3 class="dept-name">{{ d.name }}</h3>
          <p class="dept-en">{{ d.en }}</p>
          <p class="dept-desc">{{ d.desc }}</p>
          <p class="dept-link">进入部门 →</p>
        </RouterLink>
      </div>
    </section>

    <!-- 荣誉精选 -->
    <section class="honors container">
      <div class="section-head" v-reveal>
        <p class="section-tag">HONORS</p>
        <h2 class="section-title">荣誉精选</h2>
        <RouterLink to="/honors" class="section-more">全部荣誉 →</RouterLink>
      </div>
      <div class="honor-grid">
        <div v-for="a in featuredAwards" :key="a.id" class="honor-card" v-reveal>
          <span class="honor-year">{{ a.year }}</span>
          <p class="honor-event">{{ a.event }}</p>
          <p class="honor-result">{{ a.result }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ===== Hero ===== */
.hero {
  position: relative;
  padding: 120px 0 96px;
  overflow: hidden;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent);
  pointer-events: none;
}

.hero-inner {
  position: relative;
  text-align: center;
}

.hero-eyebrow {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.5em;
  color: var(--accent-bright);
  margin-bottom: 20px;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 28px;
}

.title-cn {
  font-size: clamp(44px, 8vw, 84px);
  font-weight: 800;
  letter-spacing: 0.18em;
  line-height: 1.1;
  background: linear-gradient(180deg, #f5f8ff 30%, var(--accent-bright) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.title-en {
  font-family: var(--font-display);
  font-size: clamp(16px, 2.6vw, 26px);
  letter-spacing: 0.6em;
  color: var(--text-dim);
}

.hero-sub {
  font-size: clamp(15px, 2vw, 18px);
  color: var(--text-dim);
  line-height: 1.9;
  max-width: 640px;
  margin: 0 auto 36px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
}

.btn {
  padding: 12px 28px;
  border-radius: var(--radius-md);
  font-size: 15px;
  transition:
    transform var(--dur-fast) var(--ease),
    box-shadow var(--dur-fast) var(--ease),
    background var(--dur-fast) var(--ease);
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 24px rgba(59, 130, 246, 0.35);
}

.btn-primary:hover {
  background: var(--accent-bright);
  box-shadow: 0 6px 30px rgba(59, 130, 246, 0.5);
  color: #fff;
}

.btn-ghost {
  border: 1px solid var(--border-strong);
  color: var(--text-dim);
}

.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--text);
}

/* ===== Stats ===== */
.stats {
  border-block: 1px solid var(--border);
  background: var(--bg-elevated);
  padding: 48px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat {
  text-align: center;
}

.stat-num {
  font-family: var(--font-display);
  font-size: clamp(32px, 4.5vw, 48px);
  font-weight: 700;
  color: var(--accent-bright);
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.stat-label {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-faint);
  letter-spacing: 0.12em;
}

/* ===== Sections ===== */
section {
  padding: 88px 0;
}

.section-head {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 40px;
}

.section-tag {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.35em;
  color: var(--gold);
}

.section-title {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.section-more {
  margin-left: auto;
  font-size: 14px;
}

/* ===== About ===== */
.about-body {
  max-width: 760px;
  font-size: 16px;
  color: var(--text-dim);
  line-height: 2;
}

.about-body p + p {
  margin-top: 16px;
}

.about-body strong {
  color: var(--text);
}

/* ===== Dept cards ===== */
.dept-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.dept-card {
  position: relative;
  padding: 24px 22px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  overflow: hidden;
  transition:
    transform var(--dur-med) var(--ease),
    border-color var(--dur-med) var(--ease),
    background var(--dur-med) var(--ease);
}

.dept-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 80% at 100% 0%, rgba(59, 130, 246, 0.08), transparent);
  opacity: 0;
  transition: opacity var(--dur-med) var(--ease);
}

.dept-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-dim);
  background: var(--bg-hover);
}

.dept-card:hover::before {
  opacity: 1;
}

.dept-idx {
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--text-faint);
  margin-bottom: 12px;
}

.dept-name {
  font-size: 18px;
  font-weight: 700;
}

.dept-en {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--accent-bright);
  margin: 3px 0 12px;
}

.dept-desc {
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.75;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dept-link {
  position: relative;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-faint);
  transition: color var(--dur-fast) var(--ease);
}

.dept-card:hover .dept-link {
  color: var(--accent-bright);
}

/* ===== Honors ===== */
.honor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.honor-card {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  transition:
    border-color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease);
}

.honor-card:hover {
  border-color: var(--gold-dim);
  transform: translateY(-2px);
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
  .dept-grid,
  .honor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 80px 0 64px;
  }
  section {
    padding: 56px 0;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }
  .dept-grid,
  .honor-grid {
    grid-template-columns: 1fr;
  }
  .section-head {
    flex-wrap: wrap;
  }
  .section-more {
    margin-left: 0;
  }
}
</style>
