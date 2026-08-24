// 滚动显现指令：v-reveal — IntersectionObserver 驱动（design-trends 规范）
// script setup 中需以 vReveal 命名导出/导入才能被 vue-tsc 识别
// SSR/预渲染环境无 IntersectionObserver → 惰性创建并直接显示（不阻塞预渲染）
import type { Directive } from 'vue';

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (observer) return observer;
  if (typeof IntersectionObserver === 'undefined') return null;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer?.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  return observer;
}

export const vReveal: Directive = {
  mounted(el) {
    const obs = getObserver();
    if (!obs) {
      // 无 IntersectionObserver（SSR/旧环境）：直接可见
      el.classList.add('reveal', 'visible');
      return;
    }
    el.classList.add('reveal');
    obs.observe(el);
  },
  unmounted(el) {
    observer?.unobserve(el);
  },
};
