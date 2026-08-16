// 已上线部门子站注册表 — 增量接口
// 新子站上线时向数组追加一条即可（部门占位页自动切换为"已上线"形态）
// 对应部门 slug：attack/forensics/modeling/algorithm/bigdata/dev/ai/pr

export interface SubsiteInfo {
  /** 部门 slug（与 src/data/team.ts departments 对齐） */
  slug: string
  /** 子站地址 */
  url: string
  /** 一句话定位 */
  tagline: string
  /** 核心功能（展示用） */
  features: string[]
  /** 上线时间 */
  launchedAt: string
}

export const liveSubsites: SubsiteInfo[] = [
  {
    slug: 'dev',
    url: 'https://dev.cyberswat.cn',
    tagline: '开发部协作平台 — 公告 / 信息流转 / 点子墙 / 项目任务 / 社区',
    features: ['公告与已读追踪', '点子墙与项目孵化', '任务闭环', '成员社区', 'AI agent 接入'],
    launchedAt: '2026-08-15',
  },
]
