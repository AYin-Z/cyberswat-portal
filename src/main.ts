import { ViteSSG } from 'vite-ssg'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setupRouter } from './router'
import { vReveal } from './directives/reveal'
import './assets/main.css'

// vite-ssg: 预渲染（SSG）+ SPA 降级双模式
// 构建时静态生成每个路由的 HTML（SEO），运行时仍为 SPA
export const createApp = ViteSSG(
  App,
  { routes: setupRouter() },
  ({ app, router }) => {
    app.directive('reveal', vReveal)
    app.use(createPinia())
    // 预渲染时滚动行为不执行（无真实滚动）
    if (!import.meta.env.SSR) {
      router.afterEach((to) => {
        if (to.meta.title) document.title = to.meta.title as string
      })
    }
  },
)
