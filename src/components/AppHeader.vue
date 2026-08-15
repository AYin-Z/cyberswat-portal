<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const scrolled = ref(false)
const menuOpen = ref(false)

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
      <RouterLink to="/" class="brand" @click="menuOpen = false">
        <img src="/logo.png" alt="CyberSWAT 队徽" class="brand-mark" />
        <span class="brand-text">
          <strong>CyberSWAT</strong>
          <em>网络特警队</em>
        </span>
      </RouterLink>

      <!-- 桌面端导航 -->
      <nav class="links" aria-label="主导航">
        <RouterLink v-for="item in nav" :key="item.to" :to="item.to" class="link">
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- 移动端汉堡按钮 -->
      <button
        class="burger"
        :class="{ open: menuOpen }"
        :aria-expanded="menuOpen"
        :aria-label="menuOpen ? '关闭菜单' : '打开菜单'"
        @click="menuOpen = !menuOpen"
      >
        <span class="bar" /><span class="bar" /><span class="bar" />
      </button>
    </div>

    <!-- 移动端抽屉菜单 -->
    <Transition name="drawer">
      <nav v-if="menuOpen" class="drawer" aria-label="移动端导航">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="drawer-link"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </Transition>
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

/* 汉堡按钮（仅移动端显示） */
.burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 8px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.burger .bar {
  display: block;
  height: 2px;
  width: 100%;
  background: var(--text);
  border-radius: 2px;
  transition:
    transform var(--dur-fast) var(--ease),
    opacity var(--dur-fast) var(--ease);
}

.burger.open .bar:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.burger.open .bar:nth-child(2) {
  opacity: 0;
}
.burger.open .bar:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* 移动端抽屉 */
.drawer {
  display: none;
  flex-direction: column;
  padding: 8px 16px 16px;
  border-top: 1px solid var(--border);
  background: rgba(10, 14, 26, 0.97);
}

.drawer-link {
  padding: 13px 12px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  color: var(--text-dim);
}

.drawer-link:hover,
.drawer-link.router-link-active {
  color: var(--accent-bright);
  background: var(--bg-hover);
}

.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity var(--dur-med) var(--ease),
    transform var(--dur-med) var(--ease);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 560px) {
  .brand-text em {
    display: none;
  }

  .links {
    display: none;
  }

  .burger {
    display: flex;
  }

  .drawer {
    display: flex;
  }
}
</style>
