import { describe, expect, it } from 'vitest';
import { awardCounts, awards, departments } from './team';

describe('team.ts 数据一致性（单一事实源）', () => {
  it('部门 slug 唯一', () => {
    const slugs = departments.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('奖项 id 唯一、等级合法', () => {
    const levels = new Set(['national', 'provincial', 'international', 'industry']);
    expect(new Set(awards.map((a) => a.id)).size).toBe(awards.length);
    for (const a of awards) expect(levels.has(a.level)).toBe(true);
  });

  it('awardCounts 与 awards 派生一致（首页统计不得手工维护）', () => {
    const total =
      awardCounts.international +
      awardCounts.national +
      awardCounts.provincial +
      awardCounts.industry;
    expect(total).toBe(awards.length);
  });

  it('国家/省部级口径：由 level 直接计数', () => {
    expect(awardCounts.national).toBe(awards.filter((a) => a.level === 'national').length);
    expect(awardCounts.provincial).toBe(awards.filter((a) => a.level === 'provincial').length);
  });
});
