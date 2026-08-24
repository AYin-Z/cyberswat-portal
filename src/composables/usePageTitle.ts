import { useHead } from '@unhead/vue';

/**
 * 页面标题管理（预渲染 + 运行时双模式）
 * vite-ssg 预渲染时 unhead 会把 title 写入静态 HTML（SEO 关键）
 * 运行时 useHead 同步 document.title
 */
export function usePageTitle(title: string) {
  useHead({
    title: `${title} · CyberSWAT`,
    meta: [{ name: 'description', content: getDescription(title) }],
  });
}

function getDescription(title: string): string {
  const map: Record<string, string> = {
    网络特警队:
      'CyberSWAT 网络特警队官方门户 — 网络攻防 / 电子取证 / 数学建模 / 算法 / 大数据 / 开发 / AI 七大方向。',
    社团介绍: 'CyberSWAT 网络特警队社团介绍 — 沿革时间线、组织架构与发展历程。',
    荣誉墙: 'CyberSWAT 荣誉墙 — 2023-2025 国家级 / 省部级 / 国际赛事奖项全览。',
    部门: 'CyberSWAT 八大部门 — 攻防 / 取证 / 建模 / 算法 / 大数据 / 开发 / AI / 宣传。',
    资讯: 'CyberSWAT 资讯频道 — 队伍动态与活动信息。',
  };
  return map[title] ?? 'CyberSWAT 网络特警队官方门户。';
}
