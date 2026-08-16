// 成员风采 — 数据源：docs/showcase-2023-2024.md / team-report-2025.md（公网脱敏口径）
// 脱敏规则：不出现真实姓名 / 姓氏 / 区队 / 联系方式。
//   有公开平台 ID（GitHub/战队 ID）的展示 ID；无 ID 的以「年级 + 部门 + 角色」标识。
// 增量接口：招新/换届后向数组追加条目即可（id 唯一，按 grade 分组自动排序）

export interface MemberProfile {
  /** 唯一 id（slug） */
  id: string
  /** 公开平台 ID（GitHub / 战队 ID，展示用；无则留空） */
  handle?: string
  /** 年级，如 '2022'（展示为 22级） */
  grade: string
  /** 部门方向 */
  dept: string
  /** 职务/身份 */
  role: string
  /** 一句话寄语（公开采访摘录，非必填） */
  quote?: string
  /** 高光标签（非必填） */
  highlight?: string
}

export const members: MemberProfile[] = [
  // —— 2020 级 ——
  {
    id: 'yuanlao-shizhang',
    grade: '2020',
    dept: '综合',
    role: '社长',
    quote: '祝草木蔓发，春山可望',
    highlight: '转校级社团功臣',
  },
  // —— 2021 级 ——
  {
    id: 'qianshezhang',
    grade: '2021',
    dept: '攻防',
    role: '前社长',
    highlight: '0psu3 战队创始人',
  },
  {
    id: 'qian-suanfa',
    grade: '2021',
    dept: '算法',
    role: '前算法部长',
  },
  {
    id: 'qian-jianmo',
    grade: '2021',
    dept: '建模',
    role: '前建模部长',
  },
  {
    id: 'qian-dashuju',
    grade: '2021',
    dept: '大数据',
    role: '前大数据负责人',
  },
  {
    id: 'qian-quzheng',
    grade: '2021',
    dept: '取证',
    role: '前取证负责人',
  },
  {
    id: 'qian-mimashou',
    grade: '2021',
    dept: '攻防',
    role: '0psu3 骨干 · 密码手',
  },
  // —— 2022 级 ——
  {
    id: 'korey0sh1',
    handle: 'Korey0sh1',
    grade: '2022',
    dept: '攻防',
    role: '社长兼攻防负责人',
    highlight: '0psu3 现役队长',
  },
  {
    id: 'cat-zn',
    handle: 'Cat_zn',
    grade: '2022',
    dept: '取证',
    role: '团支书兼取证负责人',
  },
  {
    id: 'fuzhe-jianmo',
    grade: '2022',
    dept: '建模',
    role: '副社长兼建模负责人',
  },
  {
    id: 'fuzhe-suanfa',
    grade: '2022',
    dept: '算法',
    role: '副社长兼算法负责人',
  },
  {
    id: 'zuwei-dashuju',
    grade: '2022',
    dept: '大数据',
    role: '组委兼大数据负责人',
  },
  {
    id: 'mihoyo',
    handle: 'mihoyo',
    grade: '2022',
    dept: '宣传',
    role: '宣传委员兼宣传办公室主任',
  },
  {
    id: 'xuanchuan-gugan',
    grade: '2022',
    dept: '宣传',
    role: '宣传骨干',
  },
  {
    id: 'quzheng-gugan',
    grade: '2022',
    dept: '取证',
    role: '取证骨干',
  },
  {
    id: 'gongfang-gugan-1',
    grade: '2022',
    dept: '攻防',
    role: '攻防骨干',
  },
  {
    id: 'gongfang-gugan-2',
    grade: '2022',
    dept: '攻防',
    role: '攻防骨干',
  },
  {
    id: 'gongfang-gugan-3',
    grade: '2022',
    dept: '攻防',
    role: '攻防骨干',
  },
  {
    id: '0psu3-gugan',
    grade: '2022',
    dept: '攻防',
    role: '0psu3 骨干',
  },
  // —— 2023 级 ——
  {
    id: 'xuanchuan-23',
    grade: '2023',
    dept: '宣传',
    role: '宣传骨干',
  },
  {
    id: 'dashuju-23',
    grade: '2023',
    dept: '大数据',
    role: '大数据骨干',
  },
  {
    id: 'gongfang-23',
    grade: '2023',
    dept: '攻防',
    role: '攻防骨干',
  },
  {
    id: 'quzheng-23',
    grade: '2023',
    dept: '取证',
    role: '取证骨干',
  },
  {
    id: 'jianmo-23',
    grade: '2023',
    dept: '建模',
    role: '建模骨干',
  },
  {
    id: 'suanfa-23',
    grade: '2023',
    dept: '算法',
    role: '算法骨干',
  },
  {
    id: 'suanfa-jianmo-23',
    grade: '2023',
    dept: '算法',
    role: '算法 & 建模',
  },
]
