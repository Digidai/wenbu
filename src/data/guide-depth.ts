import { baziDepth } from './guide-depth-bazi';
import { symbolsDepth } from './guide-depth-symbols';
import { practiceDepth } from './guide-depth-practice';
import type { GuideExpansion } from './guide-types';

export const guideDepth: Record<string, GuideExpansion> = { ...baziDepth, ...symbolsDepth, ...practiceDepth };
export const handbookUpdated = '2026-09-30';
