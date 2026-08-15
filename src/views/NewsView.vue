<script setup lang="ts">
import { ref } from 'vue'
import { news } from '@/data/news'
import { vReveal } from '@/directives/reveal'
import { usePageTitle } from '@/composables/usePageTitle'
usePageTitle('资讯')

const expanded = ref<number | null>(null)

const categoryColor: Record<string, string> = {
  动态: 'var(--accent-bright)',
  赛事: 'var(--warning)',
  荣誉: 'var(--success)',
}
</script>

<template>
  <div class="news-page">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow" v-reveal>NEWS</p>
        <h1 class="title" v-reveal>资讯</h1>
        <p class="sub" v-reveal>队伍动态与赛事快讯</p>
      </div>
    </section>

    <section class="content container">
      <div class="list">
        <article
          v-for="n in news"
          :key="n.id"
          class="item"
          :class="{ open: expanded === n.id }"
          v-reveal
        >
          <button class="item-head" @click="expanded = expanded === n.id ? null : n.id">
            <span class="date">{{ n.date }}</span>
            <span class="cat" :style="{ color: categoryColor[n.category], borderColor: categoryColor[n.category] }">
              {{ n.category }}
            </span>
            <h3>{{ n.title }}</h3>
            <span class="toggle" :class="{ open: expanded === n.id }">+</span>
          </button>
          <div v-if="expanded === n.id" class="item-body">
            <p class="summary">{{ n.summary }}</p>
            <p v-for="(para, i) in n.content" :key="i" class="para">{{ para }}</p>
          </div>
        </article>
      </div>
      <p class="footnote">内容整理自队伍年度报告与风采展示 · 更多动态请关注公众号</p>
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
}

.content {
  padding-bottom: 96px;
  max-width: 860px;
}

.list {
  border-top: 1px solid var(--border);
}

.item {
  border-bottom: 1px solid var(--border);
}

.item-head {
  display: grid;
  grid-template-columns: 92px 56px 1fr 32px;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 22px 8px;
  background: transparent;
  border: none;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: background var(--dur-fast) var(--ease);
}

.item-head:hover {
  background: var(--bg-card);
}

.date {
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--text-faint);
}

.cat {
  font-size: 11px;
  letter-spacing: 0.1em;
  border: 1px solid;
  border-radius: 999px;
  padding: 2px 10px;
  text-align: center;
}

.item-head h3 {
  font-size: 16px;
  font-weight: 600;
}

.toggle {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--text-faint);
  transition: transform var(--dur-med) var(--ease);
}

.toggle.open {
  transform: rotate(45deg);
  color: var(--accent-bright);
}

.item-body {
  padding: 4px 8px 24px 116px;
  animation: fadeIn 0.3s var(--ease);
}

.summary {
  font-size: 14px;
  color: var(--accent-bright);
  margin-bottom: 12px;
  line-height: 1.7;
}

.para {
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.9;
  margin-bottom: 10px;
}

.footnote {
  margin-top: 32px;
  text-align: center;
  font-size: 12px;
  color: var(--text-faint);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 640px) {
  .item-head {
    grid-template-columns: 1fr 52px;
    gap: 8px;
  }
  .date {
    grid-column: 1;
  }
  .cat {
    grid-row: 1;
    grid-column: 2;
    justify-self: end;
  }
  .item-head h3 {
    grid-column: 1 / -1;
  }
  .toggle {
    display: none;
  }
  .item-body {
    padding: 0 8px 20px;
  }
}
</style>
