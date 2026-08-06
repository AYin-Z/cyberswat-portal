<script setup lang="ts">
import { computed } from 'vue'
import { departments } from '@/data/team'
import { vReveal } from '@/directives/reveal'

const props = defineProps<{ slug: string }>()

const dept = computed(() => departments.find((d) => d.slug === props.slug))

const subdomain = computed(() => (props.slug ? `${props.slug}.cyberswat.cn` : ''))
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

    <section class="notice container" v-reveal>
      <div class="card">
        <span class="icon">⬡</span>
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
  max-width: 520px;
  margin: 0 auto;
  text-align: center;
  padding: 48px 32px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
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

.back {
  display: inline-block;
  margin-top: 24px;
  font-size: 14px;
}
</style>
