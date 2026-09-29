import type { Locale } from './schema';
export const href = (locale: Locale, path = '') =>
  `${locale === 'en' ? '/en/' : '/'}${path ? `${path.replace(/^\/+|\/+$/g, '')}/` : ''}`;
export const choose = (locale: Locale, zh: string, en: string) => (locale === 'zh' ? zh : en);
export const toolInfo = {
  bazi: {
    zh: '八字命盘',
    en: 'BaZi chart',
    eyebrow: 'THE FOUR PILLARS',
    eyebrowZh: '四柱八字',
    symbol: '命',
    descriptionZh: '根据出生日期与时间排四柱，查看干支、日主与五行构成。',
    descriptionEn: 'Use your birth details to explore the Four Pillars, Day Master and five elements.',
    color: 'sage',
  },
  iching: {
    zh: '易经问卦',
    en: 'I Ching',
    eyebrow: 'THE BOOK OF CHANGES',
    eyebrowZh: '六爻与变化',
    symbol: '易',
    descriptionZh: '围绕一件具体的事起卦，查看本卦、动爻与之卦。',
    descriptionEn: 'Cast a hexagram for a question, then explore its changing lines and resulting hexagram.',
    color: 'clay',
  },
  tarot: {
    zh: '塔罗映照',
    en: 'Tarot reading',
    eyebrow: 'ONE OR THREE CARDS',
    eyebrowZh: '从一张或三张牌开始',
    symbol: '象',
    descriptionZh: '抽一张或三张牌，结合画面与关键词，梳理眼前的问题。',
    descriptionEn: 'Draw one or three cards and use their images and keywords to think through a situation.',
    color: 'gold',
  },
  ziwei: {
    zh: '紫微星盘',
    en: 'Zi Wei chart',
    eyebrow: 'THE TWELVE PALACES',
    eyebrowZh: '十二宫与星曜',
    symbol: '星',
    descriptionZh: '根据出生日期与时辰排盘，逐宫查看星曜及传统含义。',
    descriptionEn:
      'Enter your birth date and time to explore the stars and traditional themes of twelve palaces.',
    color: 'blue',
  },
};
