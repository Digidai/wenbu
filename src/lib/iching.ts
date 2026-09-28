import { castSchema } from './schema';
import { hexagrams, kingWen, trigramBits, trigrams } from '../data/hexagrams';

export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max < 1 || max > 0xffffffff) throw new RangeError('Invalid random range');
  const limit = 0x100000000 - (0x100000000 % max);
  const a = new Uint32Array(1);
  do {
    crypto.getRandomValues(a);
  } while (a[0] >= limit);
  return a[0] % max;
}
export function identifyHexagram(bits: string) {
  if (!/^[01]{6}$/.test(bits)) throw new RangeError('Six bottom-to-top bits required');
  const lower = trigramBits.indexOf(bits.slice(0, 3));
  const upper = trigramBits.indexOf(bits.slice(3));
  const number = kingWen[upper][lower];
  return { ...hexagrams[number - 1], bits, lower: trigrams[lower], upper: trigrams[upper] };
}
export function castIching(raw: unknown) {
  const input = castSchema.parse(raw);
  const lines =
    input.lines ?? Array.from({ length: 6 }, () => 6 + randomInt(2) + randomInt(2) + randomInt(2));
  const original = identifyHexagram(lines.map((x) => (x % 2 ? '1' : '0')).join(''));
  const changed = identifyHexagram(lines.map((x) => (x === 6 || x === 7 ? '1' : '0')).join(''));
  return {
    kind: 'iching' as const,
    version: 'wenbu-iching-1.0',
    lines,
    moving: lines.flatMap((x, i) => (x === 6 || x === 9 ? [i + 1] : [])),
    original,
    changed,
    method: {
      name: input.lines ? 'manual-three-coins' : 'cryptographic-three-coins',
      order: 'bottom-to-top',
      probabilities: { 6: 0.125, 7: 0.375, 8: 0.375, 9: 0.125 },
      source: 'https://ctext.org/book-of-changes',
      note: 'Themes are original reflection prompts, not quotations or predictions. Multiple moving lines are shown without claiming a single universal reading rule.',
    },
  };
}
export type IchingResult = ReturnType<typeof castIching>;
