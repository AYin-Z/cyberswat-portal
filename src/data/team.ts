// 网络特警队内容数据 — 来源：校宣传部门年度报告 (docs/team-report-2025.md)
// 注意：门户转载需标注来源"校宣传部门/团委"

export interface Department {
  slug: string;
  name: string;
  en: string;
  desc: string;
  teams?: string[];
}

export interface Award {
  id: number;
  dept: string;
  event: string;
  result: string;
  level: 'national' | 'provincial' | 'international' | 'industry';
  year: number;
}

// 八大部门 — slug 与子域名对齐（attack.cyberswat.cn 等）
export const departments: Department[] = [
  {
    slug: 'attack',
    name: '攻防部门',
    en: 'Attack & Defense',
    desc: '主打网络攻防与 CTF 竞赛，旗下 0psu3 战队拿下 WMCTF 2025 全球第三。',
    teams: ['0psu3'],
  },
  {
    slug: 'forensics',
    name: '取证部门',
    en: 'Digital Forensics',
    desc: '坚持"以赛促练、以赛促学"，聚焦电子数据取证与分析，旗下 406取证人 团队勇夺盘古石杯总冠军。',
    teams: ['406取证人'],
  },
  {
    slug: 'modeling',
    name: '建模部门',
    en: 'Mathematical Modeling',
    desc: '数学建模竞赛主力，2025 美赛国际一等奖，覆盖数学应用与大数据建模。',
  },
  {
    slug: 'algorithm',
    name: '算法部门',
    en: 'Algorithm',
    desc: '算法竞赛与程序设计，蓝桥杯、百度之星、计算机博弈锦标赛等赛事主力。',
  },
  {
    slug: 'bigdata',
    name: '大数据部门',
    en: 'Big Data',
    desc: '大数据技能与数据警务，全国公安系统最专业大数据赛事"智警杯"主力。',
  },
  {
    slug: 'dev',
    name: '开发部门',
    en: 'Development',
    desc: '校园平台与工程化开发，主导院内算法平台、成果平台等项目。',
  },
  {
    slug: 'ai',
    name: '人工智能部门',
    en: 'Artificial Intelligence',
    desc: 'AI 技术研究与落地实践，探索人工智能在警务场景的应用。',
  },
  {
    slug: 'pr',
    name: '宣传办公室',
    en: 'Publicity Office',
    desc: '队伍品牌建设与对外宣传，运营年度报告等队伍内容。',
  },
];

// 2023-2025 荣誉墙（重点节选，全量见 docs/）
export const awards: Award[] = [
  // —— 2023 ——
  {
    id: 1,
    dept: 'attack',
    event: '古剑山第一届全国大学生网络攻防大赛',
    result: '决赛第2名',
    level: 'national',
    year: 2023,
  },
  {
    id: 2,
    dept: 'attack',
    event: '"华为杯"第二届中国研究生网络安全创新大赛',
    result: '实网对抗赛全国一等奖 + 三等奖',
    level: 'national',
    year: 2023,
  },
  {
    id: 3,
    dept: 'attack',
    event: '第十六届全国大学生信息安全竞赛',
    result: '全国二等奖',
    level: 'national',
    year: 2023,
  },
  {
    id: 4,
    dept: 'attack',
    event: '第七届"蓝帽杯"全国大学生网络安全技能大赛',
    result: '一等奖3 + 三等奖2，霖霹阿斯优山第一名',
    level: 'national',
    year: 2023,
  },
  {
    id: 5,
    dept: 'attack',
    event: '第七届"强网杯"全国网络安全挑战赛',
    result: '线上 + 线下三等奖（历史首次晋级线下）',
    level: 'national',
    year: 2023,
  },
  {
    id: 6,
    dept: 'modeling',
    event: '美国大学生数学建模竞赛',
    result: 'F奖（特等奖提名）2队 + M奖1队',
    level: 'international',
    year: 2023,
  },
  {
    id: 7,
    dept: 'modeling',
    event: '"高教社杯"全国大学生数学建模竞赛',
    result: '国家级二等奖（刷新校史）',
    level: 'national',
    year: 2023,
  },
  {
    id: 8,
    dept: 'bigdata',
    event: '第六届全国大学生大数据竞赛',
    result: '总决赛二等奖 + 三等奖',
    level: 'national',
    year: 2023,
  },
  // —— 2024 ——
  {
    id: 9,
    dept: 'attack',
    event: '第十七届全国大学生信息安全竞赛',
    result: '一等奖（首个国赛一等奖）',
    level: 'national',
    year: 2024,
  },
  {
    id: 10,
    dept: 'attack',
    event: '第四届"网鼎杯"网络安全大赛',
    result: '青龙组第4（首次闯入决赛）',
    level: 'national',
    year: 2024,
  },
  {
    id: 11,
    dept: 'attack',
    event: 'WMCTF 2024',
    result: '世界第16',
    level: 'international',
    year: 2024,
  },
  {
    id: 12,
    dept: 'attack',
    event: '"凌武杯"D^3CTF 2024',
    result: '世界第17',
    level: 'international',
    year: 2024,
  },
  {
    id: 13,
    dept: 'attack',
    event: '第八届"强网杯"',
    result: '第20名 三等奖（破历史最佳）',
    level: 'national',
    year: 2024,
  },
  {
    id: 14,
    dept: 'forensics',
    event: '第十届"美亚杯"电子数据取证大赛',
    result: '一等奖3 + 二等奖3 + 三等奖3（历史最佳）',
    level: 'national',
    year: 2024,
  },
  {
    id: 15,
    dept: 'forensics',
    event: '第二届"盘古石杯"电子数据取证大赛',
    result: '线上一等奖 + 线下决赛一等奖',
    level: 'national',
    year: 2024,
  },
  {
    id: 16,
    dept: 'forensics',
    event: '第六届"智警杯"大数据技能竞赛',
    result: '特等奖2 + 一等奖1 + 二等奖2（破历史最佳）',
    level: 'industry',
    year: 2024,
  },
  {
    id: 17,
    dept: 'algorithm',
    event: '中国计算机博弈锦标赛',
    result: '"盘古眼"中国象棋亚军 全国一等奖',
    level: 'national',
    year: 2024,
  },
  {
    id: 18,
    dept: 'modeling',
    event: '第十四届 MathorCup',
    result: '国家一等奖3 + 三等奖2',
    level: 'national',
    year: 2024,
  },
  // —— 2025 ——
  {
    id: 19,
    dept: 'attack',
    event: 'WMCTF 2025 国际赛',
    result: '全球第三',
    level: 'international',
    year: 2025,
  },
  {
    id: 20,
    dept: 'attack',
    event: '第十八届全国大学生信息安全竞赛',
    result: '一等奖 + 二等奖',
    level: 'national',
    year: 2025,
  },
  {
    id: 21,
    dept: 'attack',
    event: '全国大学生软件创新大赛（软件系统安全赛）',
    result: '一等奖',
    level: 'national',
    year: 2025,
  },
  {
    id: 22,
    dept: 'attack',
    event: 'DASCTF 2025 下半年赛',
    result: '冠军',
    level: 'industry',
    year: 2025,
  },
  {
    id: 23,
    dept: 'attack',
    event: '羊城杯网络安全大赛',
    result: '一等奖',
    level: 'provincial',
    year: 2025,
  },
  {
    id: 24,
    dept: 'attack',
    event: '第十届上海市大学生网络安全大赛',
    result: '一等奖 + 二等奖',
    level: 'provincial',
    year: 2025,
  },
  {
    id: 25,
    dept: 'attack',
    event: '华为杯第四届中国研究生网络安全创新大赛',
    result: '一等奖 + 三等奖',
    level: 'national',
    year: 2025,
  },
  {
    id: 26,
    dept: 'attack',
    event: '西湖论剑·杭州网络安全技能大赛',
    result: '三等奖',
    level: 'national',
    year: 2025,
  },
  {
    id: 27,
    dept: 'attack',
    event: '第三届京麒 CTF 挑战赛',
    result: '三等奖',
    level: 'industry',
    year: 2025,
  },
  {
    id: 28,
    dept: 'forensics',
    event: '第三届"盘古石杯"国际电子数据取证大赛',
    result: '总冠军',
    level: 'international',
    year: 2025,
  },
  {
    id: 29,
    dept: 'forensics',
    event: '"美亚杯"第十一届电子数据取证大赛',
    result: '冠军 + 一二三等奖多项',
    level: 'national',
    year: 2025,
  },
  {
    id: 30,
    dept: 'forensics',
    event: '第二届"数证杯"电子数据取证分析大赛',
    result: '团体二三等奖 + 个人二等奖',
    level: 'national',
    year: 2025,
  },
  {
    id: 31,
    dept: 'forensics',
    event: '第五届全国网络空间取证大赛 FIC',
    result: '二等奖 + 三等奖',
    level: 'national',
    year: 2025,
  },
  {
    id: 32,
    dept: 'modeling',
    event: '2025 美国大学生数学建模竞赛',
    result: '国际一等奖',
    level: 'international',
    year: 2025,
  },
  {
    id: 33,
    dept: 'modeling',
    event: 'MathorCup 数学应用挑战赛',
    result: '多个一二三等奖',
    level: 'national',
    year: 2025,
  },
  {
    id: 34,
    dept: 'modeling',
    event: '全国大学生数学建模竞赛',
    result: '二等奖',
    level: 'national',
    year: 2025,
  },
  {
    id: 35,
    dept: 'algorithm',
    event: '第十九届中国计算机博弈锦标赛',
    result: '亚军',
    level: 'national',
    year: 2025,
  },
  {
    id: 36,
    dept: 'algorithm',
    event: '第十六届蓝桥杯',
    result: '多个一二三等奖',
    level: 'national',
    year: 2025,
  },
  {
    id: 37,
    dept: 'algorithm',
    event: '第21届百度之星程序设计大赛',
    result: '省赛银奖',
    level: 'provincial',
    year: 2025,
  },
  {
    id: 38,
    dept: 'bigdata',
    event: '第七届"智警杯"大数据技能竞赛',
    result: '多个学生组一等奖、二等奖',
    level: 'industry',
    year: 2025,
  },
];

// 荣誉墙统计（单一事实源：由 awards 派生，供首页指标/统计卡片使用，禁止手工维护数字）
export const awardCounts = {
  international: awards.filter((a) => a.level === 'international').length,
  national: awards.filter((a) => a.level === 'national').length,
  provincial: awards.filter((a) => a.level === 'provincial').length,
  industry: awards.filter((a) => a.level === 'industry').length,
};

// 友情链接
export const friendLinks = [
  {
    name: '0psu3',
    desc: '网络特警队攻防战队 · CTF 校队',
    url: 'https://0psu3.team',
  },
];
