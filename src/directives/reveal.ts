// 滚动显现指令：v-reveal — IntersectionObserver 驱动（design-trends 规范）
// script setup 中需以 vReveal 命名导出/导入才能被 vue-tsc 识别
import type { Directive } from 'vue'

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    }
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
)

export const vReveal: Directive = {
  mounted(el) {
    el.classList.add('reveal')
    observer.observe(el)
  },
  unmounted(el) {
    observer.unobserve(el)
  },
}
