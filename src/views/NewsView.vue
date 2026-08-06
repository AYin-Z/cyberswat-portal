<script setup lang="ts">
import { vReveal } from '@/directives/reveal'
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

    <section class="notice container" v-reveal>
      <div class="card">
        <span class="icon">⬡</span>
        <h2>资讯频道建设中</h2>
        <p>公众号内容同步机制规划中，敬请期待。</p>
        <RouterLink to="/" class="back">← 返回首页</RouterLink>
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
}

.back {
  display: inline-block;
  margin-top: 24px;
  font-size: 14px;
}
</style>
