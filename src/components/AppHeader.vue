<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const nav = [
  { to: '/', label: '首页' },
  { to: '/about', label: '社团介绍' },
  { to: '/honors', label: '荣誉墙' },
  { to: '/departments', label: '部门' },
]
</script>

<template>
  <header class="nav" :class="{ scrolled }">
    <div class="container nav-inner">
      <RouterLink to="/" class="brand">
        <img src="/logo.png" alt="CyberSWAT 队徽" class="brand-mark" />
        <span class="brand-text">
          <strong>CyberSWAT</strong>
          <em>网络特警队</em>
        </span>
      </RouterLink>

      <nav class="links">
        <RouterLink v-for="item in nav" :key="item.to" :to="item.to" class="link">
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 14, 26, 0.82);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition:
    border-color var(--dur-med) var(--ease),
    background var(--dur-med) var(--ease);
}

.nav.scrolled {
  border-bottom-color: var(--border);
  background: rgba(10, 14, 26, 0.94);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
}

.brand-mark {
  width: 26px;
  height: 28px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.25));
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand-text strong {
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: 0.06em;
}

.brand-text em {
  font-style: normal;
  font-size: 11px;
  color: var(--text-dim);
}

.links {
  display: flex;
  gap: 4px;
}

.link {
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-dim);
}

.link:hover {
  color: var(--text);
  background: var(--bg-hover);
}

.link.router-link-active {
  color: var(--accent-bright);
}

@media (max-width: 560px) {
  .brand-text em {
    display: none;
  }
  .link {
    padding: 7px 9px;
    font-size: 13px;
  }
}
</style>
