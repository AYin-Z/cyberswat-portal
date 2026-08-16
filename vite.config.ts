import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
  // vite-ssg 预渲染配置
  // 注意：只列静态页。departments/:slug 动态路由展开在 SSR 渲染有 bug（渲染成首页），
  // 且占位页 SEO 价值低 → 走 SPA fallback（nginx try_files → /index.html，运行时渲染正确）
  ssgOptions: {
    includedRoutes: () => ['/', '/about', '/honors', '/members', '/departments', '/news'],
  },
})
