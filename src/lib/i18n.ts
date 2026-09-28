import type { Locale } from './schema';
export const href = (locale: Locale, path = '') =>
  `${locale === 'en' ? '/en/' : '/'}${path ? `${path.replace(/^\/+|\/+$/g, '')}/` : ''}`;
export const choose = (locale: Locale, zh: string, en: string) => (locale === 'zh' ? zh : en);
export const toolInfo = {
  bazi: {
    zh: '八字命盘',
    en: 'BaZi chart',
    eyebrow: 'THE FOUR PILLARS',
    symbol: '命',
    descriptionZh: '从出生时刻，读懂自己的五行底色。',
    descriptionEn: 'Explore the four pillars and five elements of your birth chart.',
    color: 'sage',
  },
  iching: {
    zh: '易经问卦',
    en: 'I Ching',
    eyebrow: 'THE BOOK OF CHANGES',
    symbol: '易',
    descriptionZh: '把此刻的疑问，放进变化的视角里。',
    descriptionEn: 'Meet a present question through the language of change.',
    color: 'clay',
  },
  tarot: {
    zh: '塔罗映照',
    en: 'Tarot reading',
    eyebrow: 'A DIFFERENT PERSPECTIVE',
    symbol: '象',
    descriptionZh: '抽一张牌，为心里的事情找到新的角度。',
    descriptionEn: 'Draw a card and find a fresh angle on what is on your mind.',
    color: 'gold',
  },
  ziwei: {
    zh: '紫微星盘',
    en: 'Zi Wei chart',
    eyebrow: 'THE TWELVE PALACES',
    symbol: '星',
    descriptionZh: '十二宫与星曜，另一种认识自己的地图。',
    descriptionEn: 'A twelve-palace map for another way of seeing yourself.',
    color: 'blue',
  },
};
