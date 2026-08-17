<script setup lang="ts">
import { vReveal } from '@/directives/reveal'
import { usePageTitle } from '@/composables/usePageTitle'
usePageTitle('社团介绍')


const timeline = [
  {
    year: '2014',
    title: '前身成立',
    desc: '院级社团「网络特警队」成立。',
  },
  {
    year: '2022.04',
    title: '队伍成立',
    desc: '网络特警队正式成立，由校团委指导。',
  },
  {
    year: '2023',
    title: '国赛突破',
    desc: '0psu3 获第十六届全国大学生信息安全竞赛全国二等奖，刷新校史。',
  },
  {
    year: '2024',
    title: '首个国一',
    desc: '第十七届全国大学生信息安全竞赛一等奖，网鼎杯青龙组第4。',
  },
  {
    year: '2025',
    title: '国际舞台',
    desc: 'WMCTF 2025 全球第三；全年国家级奖项 12 项、省部级 20+ 项。',
  },
]

const principles = [
  {
    icon: 'shield',
    title: '政治建警',
    desc: '以习近平新时代中国特色社会主义思想为主导，贯彻学校"五育并举"决策部署。',
  },
  {
    icon: 'chip',
    title: '科技兴警',
    desc: '努力学习钻研网络安全技术，出征全国各大网络安全、算法、建模、大数据赛事。',
  },
  {
    icon: 'grid',
    title: '实战化平台',
    desc: '理论与实战融合、教学与竞赛并重，致力于网络安全交流研究。',
  },
]
</script>

<template>
  <div class="about">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow" v-reveal>ABOUT CYBERSWAT</p>
        <h1 class="title" v-reveal>社团介绍</h1>
        <p class="sub" v-reveal>一支为网络空间安全而生的网安卫士队伍</p>
      </div>
    </section>

    <section class="intro container">
      <div class="intro-text" v-reveal>
        <p>
          网络特警队（简称「网特」）成立于 <strong>2022 年 4 月</strong>，
          前身为 2014 年成立的院级社团。队伍由
          <strong>校团委指导</strong>，由学院指导老师带队。
        </p>
        <p>
          网特不仅是校园内的技术社团，更是面向网络安全实战的平台。队伍下设攻防、
          取证、建模、算法、大数据、开发、人工智能、宣传办公室八大部门，
          围绕「政治建警、科技兴警」，坚持「理论与实战融合、教学与竞赛并重」。
        </p>
        <p>
          2025 年，网特队员拿下国家级奖项 12 项、省部级及行业奖项 20 余项：
          WMCTF 2025 全球第三，盘古石杯国际电子数据取证大赛总冠军，全国大学生信息安全竞赛一等奖。
        </p>
      </div>
    </section>

    <section class="principles">
      <div class="container">
        <div class="principle-grid">
          <div v-for="p in principles" :key="p.title" class="principle-card" v-reveal>
            <span class="p-icon">
              <svg v-if="p.icon === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <svg v-else-if="p.icon === 'chip'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
                <rect x="10" y="10" width="4" height="4" />
                <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            <h3>{{ p.title }}</h3>
            <p>{{ p.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="timeline container">
      <div class="section-head" v-reveal>
        <p class="section-tag">MILESTONES</p>
        <h2 class="section-title">队伍沿革</h2>
      </div>
      <div class="tl">
        <div v-for="t in timeline" :key="t.year" class="tl-item" v-reveal>
          <span class="tl-year">{{ t.year }}</span>
          <div class="tl-body">
            <h3>{{ t.title }}</h3>
            <p>{{ t.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-hero {
  padding: 96px 0 64px;
  text-align: center;
}

.eyebrow {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.45em;
  color: var(--accent-bright);
  margin-bottom: 16px;
}

.title {
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 800;
  letter-spacing: 0.1em;
  background: linear-gradient(180deg, #f5f8ff 30%, var(--accent-bright) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sub {
  margin-top: 12px;
  color: var(--text-dim);
  font-size: 15px;
  letter-spacing: 0.08em;
}

.intro {
  max-width: 820px;
}

.intro-text p {
  font-size: 16px;
  line-height: 2.1;
  color: var(--text-dim);
}

.intro-text p + p {
  margin-top: 18px;
}

.intro-text strong {
  color: var(--text);
  font-weight: 600;
}

.principles {
  padding: 64px 0;
}

.principle-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.principle-card {
  padding: 28px 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  transition:
    border-color var(--dur-med) var(--ease),
    transform var(--dur-med) var(--ease);
}

.principle-card:hover {
  border-color: var(--accent-dim);
  transform: translateY(-3px);
}

.p-icon {
  font-size: 22px;
  color: var(--accent-bright);
}

.principle-card h3 {
  margin: 14px 0 8px;
  font-size: 17px;
}

.principle-card p {
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.8;
}

.timeline {
  padding-top: 0;
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
}

.tl {
  position: relative;
  padding-left: 32px;
}

.tl::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background: var(--border-strong);
}

.tl-item {
  position: relative;
  padding: 0 0 36px;
}

.tl-item::before {
  content: '';
  position: absolute;
  left: -30px;
  top: 6px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
}

.tl-year {
  font-family: var(--font-display);
  font-size: 13px;
  color: var(--gold);
  letter-spacing: 0.1em;
}

.tl-body {
  margin-top: 6px;
}

.tl-body h3 {
  font-size: 17px;
  font-weight: 600;
}

.tl-body p {
  margin-top: 6px;
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.8;
}

@media (max-width: 760px) {
  .principle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
