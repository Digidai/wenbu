import { astro, util } from 'iztro';
import { ziweiSchema } from './schema';
import { validateDate } from './bazi';
export function calculateZiwei(raw: unknown) {
  const input = ziweiSchema.parse(raw);
  validateDate(input.date);
  // Explicitly local civil date/time. No implied astronomical correction or imported BaZi rules.
  const index = util.timeToIndex(Number(input.time.slice(0, 2)));
  const chart = astro.bySolar(input.date, index, input.sex === 'male' ? '男' : '女', true, 'zh-CN');
  return {
    kind: 'ziwei' as const,
    version: 'wenbu-ziwei-1.0',
    input,
    lunarDate: chart.lunarDate,
    time: chart.time,
    fiveElementsClass: chart.fiveElementsClass,
    soul: chart.soul,
    body: chart.body,
    palaces: chart.palaces.map((p) => ({
      name: p.name,
      stem: p.heavenlyStem,
      branch: p.earthlyBranch,
      isBody: p.isBodyPalace,
      stars: p.majorStars.map((s) => ({ name: s.name, brightness: s.brightness, mutagen: s.mutagen ?? '' })),
      supporting: p.minorStars.map((s) => s.name),
      ageRange: p.decadal?.range ?? [],
    })),
    method: {
      engine: 'iztro@2.6.1',
      clock: 'Entered local civil clock; no solar-time correction',
      lateZi: 'iztro time index 12 (23:00) is distinct from early Zi index 0',
      leapMonth: 'fixLeap=true; iztro default leap-month convention',
      school: 'iztro default configuration; school differences are not resolved into an accuracy claim',
      source: 'https://iztro.com/quick-start',
    },
  };
}
export type ZiweiResult = ReturnType<typeof calculateZiwei>;
