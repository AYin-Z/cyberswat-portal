<script setup lang="ts">
import { friendLinks } from '@/data/team'
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="col">
        <div class="f-brand">
          <img src="/logo.png" alt="CyberSWAT 队徽" class="f-logo" />
          <div>
            <p class="f-title">CyberSWAT</p>
            <p class="f-sub">中国人民公安大学网络特警队</p>
          </div>
        </div>
        <p class="f-dim">政治建警 · 科技兴警</p>
      </div>

      <div class="col">
        <p class="f-title">友情链接</p>
        <a v-for="f in friendLinks" :key="f.url" :href="f.url" target="_blank" rel="noopener" class="f-link">
          {{ f.name }} ↗
        </a>
      </div>

      <div class="col">
        <p class="f-title">联系</p>
        <p class="f-dim">共青团中国人民公安大学委员会指导</p>
        <p class="f-dim">信息网络安全学院</p>
      </div>
    </div>

    <div class="container footer-bottom">
      <span>© 2026 CyberSWAT · cyberswat.cn</span>
      <span class="footer-source">内容来源：公大团宣</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  background: var(--bg-elevated);
  padding: 48px 0 24px;
}

.footer-inner {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1.2fr;
  gap: 32px;
}

.f-title {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.1em;
  color: var(--text);
  margin-bottom: 4px;
}

.f-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.f-logo {
  width: 40px;
  height: 44px;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.25));
}

.f-sub {
  font-size: 14px;
  color: var(--text-dim);
}

.f-dim {
  font-size: 13px;
  color: var(--text-faint);
  margin-top: 4px;
}

.f-link {
  display: block;
  font-size: 14px;
  color: var(--text-dim);
  padding: 3px 0;
}

.f-link:hover {
  color: var(--accent-bright);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 36px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-faint);
}

@media (max-width: 700px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .footer-bottom {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
