import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { departments } from '@/data/team'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 72 }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: 'CyberSWAT · 中国人民公安大学网络特警队' },
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/AboutView.vue'),
          meta: { title: '社团介绍 · CyberSWAT' },
        },
        {
          path: 'honors',
          name: 'honors',
          component: () => import('@/views/HonorsView.vue'),
          meta: { title: '荣誉墙 · CyberSWAT' },
        },
        {
          path: 'departments',
          name: 'departments',
          component: () => import('@/views/DepartmentsView.vue'),
          meta: { title: '部门 · CyberSWAT' },
        },
        // 部门子站占位路由：主站先留路由，子站按各部门 PRD 实现后挂子域名
        ...departments.map((d) => ({
          path: `departments/${d.slug}`,
          name: `dept-${d.slug}`,
          component: () => import('@/views/DeptPlaceholderView.vue'),
          props: { slug: d.slug },
          meta: { title: `${d.name} · CyberSWAT` },
        })),
        {
          path: 'news',
          name: 'news',
          component: () => import('@/views/NewsView.vue'),
          meta: { title: '资讯 · CyberSWAT' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  if (to.meta.title) document.title = to.meta.title as string
})

export default router
