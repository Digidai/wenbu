type CoverMotif =
  | 'compass'
  | 'question'
  | 'calendar'
  | 'pillars'
  | 'elements'
  | 'clock'
  | 'hexagram'
  | 'trigrams'
  | 'palaces'
  | 'transformations'
  | 'relations'
  | 'notes'
  | 'sources'
  | 'compare'
  | 'tarot';
type CoverTone = 'sage' | 'ochre' | 'slate' | 'rose';
export type ArticleCover = {
  motif: CoverMotif;
  tone: CoverTone;
  cards?: readonly [string, string];
  reversed?: boolean;
};

// A cover belongs to its article, so filtering or reordering never changes its identity.
export const articleCovers: Record<string, ArticleCover> = {
  'first-reading': { motif: 'compass', tone: 'sage' },
  'choose-a-tool': { motif: 'compare', tone: 'ochre' },
  'ask-a-better-question': { motif: 'question', tone: 'rose' },
  'prepare-birth-details': { motif: 'calendar', tone: 'slate' },
  'bazi-basics': { motif: 'pillars', tone: 'sage' },
  'five-elements': { motif: 'elements', tone: 'ochre' },
  'bazi-ten-gods': { motif: 'relations', tone: 'sage' },
  'unknown-birth-time': { motif: 'clock', tone: 'slate' },
  'birth-time-timezone': { motif: 'clock', tone: 'slate' },
  'chinese-zodiac-vs-bazi': { motif: 'calendar', tone: 'ochre' },
  'bazi-vs-western-astrology': { motif: 'compare', tone: 'slate' },
  'iching-three-coins': { motif: 'hexagram', tone: 'sage' },
  'iching-trigrams': { motif: 'trigrams', tone: 'ochre' },
  'tarot-beginner': { motif: 'tarot', tone: 'ochre', cards: ['00-fool', '17-star'] },
  'tarot-suits-and-court-cards': { motif: 'tarot', tone: 'sage', cards: ['49-king-cups', '62-queen-swords'] },
  'tarot-reversals': { motif: 'tarot', tone: 'rose', cards: ['18-moon', '19-sun'], reversed: true },
  'ziwei-twelve-palaces': { motif: 'palaces', tone: 'slate' },
  'ziwei-four-transformations': { motif: 'transformations', tone: 'slate' },
  'read-ai-with-sources': { motif: 'sources', tone: 'sage' },
  'ai-divination': { motif: 'compare', tone: 'slate' },
  'review-a-reading': { motif: 'notes', tone: 'rose' },
  'a-reading-you-can-return-to': { motif: 'notes', tone: 'sage' },
  'why-calculation-comes-first': { motif: 'pillars', tone: 'ochre' },
};

export function coverForArticle(slug: string): ArticleCover {
  return articleCovers[slug] ?? { motif: 'notes', tone: 'sage' };
}
