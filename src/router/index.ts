import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { departments } from '@/data/team';

/** 路由配置（vite-ssg 预渲染与运行时共用同一份） */
export function setupRouter() {
  return [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: 'CyberSWAT · 网络特警队' },
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
          path: 'members',
          name: 'members',
          component: () => import('@/views/MembersView.vue'),
          meta: { title: '成员风采 · CyberSWAT' },
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
          props: true, // 从 route.params.slug 注入（SSR 预渲染兼容）
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
  ];
}

/**
 * 浏览器运行时 router（惰性创建，避免预渲染/SSR 下执行 createWebHistory）
 * vite-ssg 在预渲染时用自己的 memory history，不会走到这里
 */
export function createAppRouter() {
  return createRouter({
    history: createWebHistory(),
    scrollBehavior(to, _from, saved) {
      if (saved) return saved;
      if (to.hash) return { el: to.hash, top: 72 };
      return { top: 0 };
    },
    routes: setupRouter(),
  });
}
