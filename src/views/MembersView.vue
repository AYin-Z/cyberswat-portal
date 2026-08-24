<script setup lang="ts">
import { computed } from 'vue'
import { members } from '@/data/members'
import { liveSubsitesBySlug } from '@/data/sites'
import { vReveal } from '@/directives/reveal'
import { usePageTitle } from '@/composables/usePageTitle'
usePageTitle('成员风采')

// 已上线子站入口（单一事实源 sites.ts，不在页面里硬编码 URL）
const devSubsite = liveSubsitesBySlug.get('dev')

// 按年级分组（Vidar 模式：高年级 → 低年级）
const groups = computed(() => {
  const map = new Map<string, typeof members>()
  for (const m of members) {
    const arr = map.get(m.grade) ?? []
    arr.push(m)
    map.set(m.grade, arr)
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
})

const deptColor: Record<string, string> = {
  攻防: 'var(--accent-bright)',
  取证: 'var(--success)',
  建模: 'var(--warning)',
  算法: 'var(--purple)',
  大数据: 'var(--gold)',
  开发: 'var(--accent-bright)',
  宣传: 'var(--text-dim)',
  综合: 'var(--text-dim)',
}
</script>

<template>
  <div class="members-page">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow" v-reveal>MEMBERS</p>
        <h1 class="title" v-reveal>成员风采</h1>
        <p class="sub" v-reveal>历届骨干与现役队员 · 一代代网特人</p>
      </div>
    </section>

    <section class="content container">
      <div v-for="[grade, list] in groups" :key="grade" class="group" v-reveal>
        <h2 class="grade-title">{{ grade.slice(2) }} 级</h2>
        <div class="grid">
          <div v-for="m in list" :key="m.id" class="card">
            <div class="card-top">
              <span class="avatar">{{ (m.handle ?? m.role).slice(0, 1).toUpperCase() }}</span>
              <span class="dept" :style="{ color: deptColor[m.dept] ?? 'var(--text-dim)', borderColor: deptColor[m.dept] ?? 'var(--border)' }">
                {{ m.dept }}
              </span>
            </div>
            <h3 class="name">{{ m.handle ?? '—' }}</h3>
            <p class="role">{{ m.role }}</p>
            <p v-if="m.quote" class="quote">"{{ m.quote }}"</p>
            <span v-if="m.highlight" class="highlight">{{ m.highlight }}</span>
          </div>
        </div>
      </div>

      <p class="footnote">
        名单整理自队伍年度报告与风采展示 · 按公网脱敏口径展示（仅公开标识与职务）<br />
        <template v-if="devSubsite">更多成员与实时动态见<a :href="devSubsite.url" target="_blank" rel="noopener" class="link">开发部协作平台</a></template>
      </p>
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
}

.content {
  padding-bottom: 96px;
}

.group {
  margin-bottom: 40px;
}

.grade-title {
  font-family: var(--font-display);
  font-size: 14px;
  letter-spacing: 0.3em;
  color: var(--text-faint);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 14px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 18px;
  transition:
    border-color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease);
}

.card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-dim), transparent);
  border: 1px solid var(--accent);
  color: var(--accent-bright);
}

.dept {
  font-size: 11px;
  letter-spacing: 0.08em;
  border: 1px solid;
  border-radius: 999px;
  padding: 2px 10px;
}

.name {
  font-family: var(--font-display);
  font-size: 16px;
  margin-bottom: 4px;
  color: var(--text);
}

.role {
  font-size: 13px;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.quote {
  font-size: 12px;
  color: var(--accent-bright);
  font-style: italic;
  margin-bottom: 8px;
  line-height: 1.6;
}

.highlight {
  display: inline-block;
  font-size: 11px;
  color: var(--gold);
  border: 1px solid var(--gold-dim);
  border-radius: 999px;
  padding: 2px 10px;
}

.footnote {
  margin-top: 48px;
  text-align: center;
  font-size: 12px;
  color: var(--text-faint);
  line-height: 2;
}

.link {
  color: var(--accent-bright);
}
</style>
