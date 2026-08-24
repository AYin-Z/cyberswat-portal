<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePageTitle } from '@/composables/usePageTitle';
usePageTitle('荣誉墙');

import { awards, departments } from '@/data/team';
import { vReveal } from '@/directives/reveal';

const yearFilter = ref<number | 'all'>('all');
const deptFilter = ref<string>('all');
const searchQuery = ref('');
const sortOrder = ref<'desc' | 'asc'>('desc');

const years = computed(() => [...new Set(awards.map((a) => a.year))].sort((a, b) => b - a));

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const list = awards.filter(
    (a) =>
      (yearFilter.value === 'all' || a.year === yearFilter.value) &&
      (deptFilter.value === 'all' || a.dept === deptFilter.value) &&
      (!q ||
        a.event.toLowerCase().includes(q) ||
        a.result.toLowerCase().includes(q) ||
        deptName(a.dept).toLowerCase().includes(q)),
  );
  return list.sort((a, b) => (sortOrder.value === 'desc' ? b.year - a.year : a.year - b.year));
});

const deptName = (slug: string) => departments.find((d) => d.slug === slug)?.name ?? slug;

const levelLabel: Record<string, string> = {
  international: '国际',
  national: '国家级',
  provincial: '省部级',
  industry: '行业',
};
</script>

<template>
  <div class="honors-page">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow" v-reveal>HONORS</p>
        <h1 class="title" v-reveal>荣誉墙</h1>
        <p class="sub" v-reveal>2023 — 2025 · 一路走来</p>
      </div>
    </section>

    <section class="content container">
      <div class="filters" v-reveal>
        <div class="filter-row">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="搜索赛事 / 结果 / 部门…"
              aria-label="搜索荣誉"
            />
          </div>
          <div class="sort-box">
            <button
              class="chip"
              :class="{ active: sortOrder === 'desc' }"
              @click="sortOrder = 'desc'"
            >
              最新优先
            </button>
            <button
              class="chip"
              :class="{ active: sortOrder === 'asc' }"
              @click="sortOrder = 'asc'"
            >
              最早优先
            </button>
          </div>
        </div>
        <div class="filter-group">
          <span class="filter-label">年份</span>
          <button
            class="chip"
            :class="{ active: yearFilter === 'all' }"
            @click="yearFilter = 'all'"
          >
            全部
          </button>
          <button
            v-for="y in years"
            :key="y"
            class="chip"
            :class="{ active: yearFilter === y }"
            @click="yearFilter = y"
          >
            {{ y }}
          </button>
        </div>
        <div class="filter-group">
          <span class="filter-label">部门</span>
          <button
            class="chip"
            :class="{ active: deptFilter === 'all' }"
            @click="deptFilter = 'all'"
          >
            全部
          </button>
          <button
            v-for="d in departments"
            :key="d.slug"
            class="chip"
            :class="{ active: deptFilter === d.slug }"
            @click="deptFilter = d.slug"
          >
            {{ d.name }}
          </button>
        </div>
      </div>

      <p class="count">{{ filtered.length }} 项荣誉</p>
      <p v-if="!filtered.length" class="empty">没有匹配的荣誉 — 试试调整筛选或搜索词</p>

      <div class="award-grid">
        <div v-for="a in filtered" :key="a.id" class="award-card" v-reveal>
          <div class="award-top">
            <span class="award-year">{{ a.year }}</span>
            <span class="award-level" :class="a.level">{{ levelLabel[a.level] }}</span>
          </div>
          <p class="award-event">{{ a.event }}</p>
          <p class="award-result">{{ a.result }}</p>
          <p class="award-dept">{{ deptName(a.dept) }}</p>
        </div>
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

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 220px;
}

.search-box input {
  width: 100%;
  padding: 9px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-body);
  transition: border-color var(--dur-fast) var(--ease);
}

.search-box input:focus {
  outline: none;
  border-color: var(--accent);
}

.search-box input::placeholder {
  color: var(--text-faint);
}

.sort-box {
  display: flex;
  gap: 6px;
}

.empty {
  padding: 48px 0;
  text-align: center;
  color: var(--text-faint);
  font-size: 14px;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-label {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--text-faint);
  margin-right: 6px;
}

.chip {
  padding: 6px 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-dim);
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease),
    background var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);
}

.chip:hover {
  border-color: var(--accent-dim);
  color: var(--text);
}

.chip.active {
  border-color: var(--accent);
  background: var(--accent-dim);
  color: var(--accent-bright);
}

.count {
  font-size: 13px;
  color: var(--text-faint);
  margin-bottom: 20px;
}

.award-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.award-card {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  transition:
    border-color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease);
}

.award-card:hover {
  border-color: var(--accent-dim);
  transform: translateY(-2px);
}

.award-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.award-year {
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--text-faint);
}

.award-level {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 999px;
  letter-spacing: 0.05em;
}

.award-level.international {
  color: var(--purple);
  background: rgba(188, 140, 255, 0.12);
  border: 1px solid rgba(188, 140, 255, 0.3);
}

.award-level.national {
  color: var(--gold);
  background: rgba(212, 160, 23, 0.1);
  border: 1px solid rgba(212, 160, 23, 0.3);
}

.award-level.provincial {
  color: var(--accent-bright);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.award-level.industry {
  color: var(--text-dim);
  background: rgba(154, 167, 184, 0.08);
  border: 1px solid rgba(154, 167, 184, 0.25);
}

.award-event {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.55;
}

.award-result {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.6;
}

.award-dept {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-faint);
}

@media (max-width: 900px) {
  .award-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .award-grid {
    grid-template-columns: 1fr;
  }
}
</style>
