import { describe, expect, it } from 'vitest';
import { liveSubsites, liveSubsitesBySlug } from './sites';
import { departments } from './team';

describe('sites.ts 子站注册表（视图不得硬编码子站 URL）', () => {
  it('子站 slug 必须存在于部门表', () => {
    const slugs = new Set(departments.map((d) => d.slug));
    for (const s of liveSubsites) expect(slugs.has(s.slug)).toBe(true);
  });

  it('查询表与注册表一致', () => {
    for (const s of liveSubsites) expect(liveSubsitesBySlug.get(s.slug)).toBe(s);
  });

  it('URL 均为 https 且唯一', () => {
    const urls = liveSubsites.map((s) => s.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const u of urls) expect(u).toMatch(/^https:\/\//);
  });

  it('注册表非空（至少一个已上线子站）', () => {
    expect(liveSubsites.length).toBeGreaterThan(0);
  });
});
