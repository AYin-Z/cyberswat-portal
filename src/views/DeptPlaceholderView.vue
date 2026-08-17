<script setup lang="ts">
import { computed } from 'vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { departments } from '@/data/team'
import { liveSubsites } from '@/data/sites'
import { vReveal } from '@/directives/reveal'

const props = defineProps<{ slug: string }>()
usePageTitle(departments.find((d) => d.slug === props.slug)?.name ?? '部门')

const dept = computed(() => departments.find((d) => d.slug === props.slug))
const subdomain = computed(() => (props.slug ? `${props.slug}.cyberswat.cn` : ''))
// 查子站注册表：已上线 → 展示真实入口；未上线 → 占位
const live = computed(() => liveSubsites.find((s) => s.slug === props.slug))
</script>

<template>
  <div class="placeholder">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow" v-reveal>{{ dept?.en ?? 'DEPARTMENT' }}</p>
        <h1 class="title" v-reveal>{{ dept?.name ?? '部门' }}</h1>
        <p class="sub" v-reveal>{{ dept?.desc }}</p>
      </div>
    </section>

    <!-- 子站已上线：展示真实入口 -->
    <section v-if="live" class="notice container" v-reveal>
      <div class="card live-card">
        <span class="live-badge">
          <span class="live-dot"></span>
          LIVE · {{ live.launchedAt }} 上线
        </span>
        <h2>{{ dept?.name }}协作平台</h2>
        <p>{{ live.tagline }}</p>
        <div class="features">
          <span v-for="f in live.features" :key="f" class="feature">{{ f }}</span>
        </div>
        <a :href="live.url" target="_blank" rel="noopener" class="enter-btn">
          进入 {{ dept?.name }}协作平台 ↗
        </a>
        <RouterLink to="/departments" class="back">← 返回部门列表</RouterLink>
      </div>
    </section>

    <!-- 子站建设中：占位 -->
    <section v-else class="notice container" v-reveal>
      <div class="card">
        <span class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
            <circle cx="12" cy="12" r="3.5" />
          </svg>
        </span>
        <h2>部门子站建设中</h2>
        <p>
          本站将独立部署于 <code>{{ subdomain }}</code>，由{{ dept?.name ?? '本部门' }}自主设计。
        </p>
        <p class="dim">如果你是该部门成员，请联系部门负责人提交 PRD。</p>
        <RouterLink to="/departments" class="back">← 返回部门列表</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-hero {
  padding: 96px 0 32px;
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
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  letter-spacing: 0.08em;
  background: linear-gradient(180deg, #f5f8ff 30%, var(--accent-bright) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sub {
  margin-top: 12px;
  color: var(--text-dim);
  font-size: 15px;
  max-width: 560px;
  margin-inline: auto;
}

.notice {
  padding-bottom: 96px;
}

.card {
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
  padding: 48px 32px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
}

.live-card {
  border: 1px solid var(--accent);
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59, 130, 246, 0.08), transparent),
    var(--bg-card);
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--accent-bright);
  border: 1px solid var(--accent);
  border-radius: 999px;
  padding: 4px 14px;
  margin-bottom: 18px;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 6px rgba(63, 185, 80, 0.7);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.icon {
  font-size: 32px;
  color: var(--accent-bright);
}

.card h2 {
  margin: 16px 0 10px;
  font-size: 20px;
}

.card p {
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.8;
}

.card .dim {
  margin-top: 6px;
  color: var(--text-faint);
  font-size: 13px;
}

.card code {
  font-family: var(--font-display);
  color: var(--accent-bright);
  background: var(--bg-hover);
  padding: 2px 8px;
  border-radius: 4px;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 20px 0 24px;
}

.feature {
  font-size: 12px;
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 12px;
  background: var(--bg-hover);
}

.enter-btn {
  display: inline-block;
  padding: 12px 28px;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition:
    background var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease);
}

.enter-btn:hover {
  background: var(--accent-bright);
  color: #fff;
  transform: translateY(-1px);
}

.back {
  display: block;
  margin-top: 20px;
  font-size: 14px;
}
</style>
