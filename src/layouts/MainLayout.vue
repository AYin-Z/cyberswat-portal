<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <!-- 无障碍：键盘用户跳过导航直达内容 -->
  <a href="#main-content" class="skip-link">跳到主要内容</a>
  <AppHeader />
  <main id="main-content" class="main">
    <RouterView />
  </main>
  <AppFooter />
</template>

<style scoped>
.main {
  min-height: calc(100vh - 64px);
}

.skip-link {
  position: absolute;
  top: -48px;
  left: 16px;
  z-index: 200;
  padding: 10px 18px;
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: top var(--dur-fast) var(--ease);
}

.skip-link:focus {
  top: 12px;
}
</style>
