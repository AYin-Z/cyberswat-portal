<script setup lang="ts">
import { departments } from '@/data/team'
import { vReveal } from '@/directives/reveal'
</script>

<template>
  <div class="depts-page">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow" v-reveal>DEPARTMENTS</p>
        <h1 class="title" v-reveal>八大部门</h1>
        <p class="sub" v-reveal>每个部门独立子站，由各部门自主建设</p>
      </div>
    </section>

    <section class="content container">
      <div class="list">
        <RouterLink
          v-for="(d, i) in departments"
          :key="d.slug"
          :to="`/departments/${d.slug}`"
          class="row"
          v-reveal
        >
          <span class="idx">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="info">
            <h3>{{ d.name }}</h3>
            <p class="en">{{ d.en }}</p>
          </div>
          <p class="desc">{{ d.desc }}</p>
          <span class="arrow">→</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-hero {
  padding: 96px 0 48px;
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

.content {
  padding-bottom: 96px;
}

.list {
  border-top: 1px solid var(--border);
}

.row {
  display: grid;
  grid-template-columns: 56px 200px 1fr 32px;
  align-items: center;
  gap: 20px;
  padding: 26px 8px;
  border-bottom: 1px solid var(--border);
  transition:
    background var(--dur-fast) var(--ease),
    padding var(--dur-fast) var(--ease);
}

.row:hover {
  background: var(--bg-card);
  padding-left: 16px;
  padding-right: 16px;
}

.idx {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--text-faint);
}

.info h3 {
  font-size: 19px;
  font-weight: 700;
}

.en {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--accent-bright);
  margin-top: 3px;
}

.desc {
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.7;
}

.arrow {
  color: var(--text-faint);
  transition:
    transform var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);
}

.row:hover .arrow {
  color: var(--accent-bright);
  transform: translateX(4px);
}

@media (max-width: 760px) {
  .row {
    grid-template-columns: 40px 1fr 24px;
  }
  .desc {
    grid-column: 2 / -1;
  }
}
</style>
