import { tarotDeck } from '../data/tarot';
import { randomInt } from './iching';
import { tarotSchema } from './schema';
export function drawTarot(raw: unknown) {
  const input = tarotSchema.parse(raw);
  const ids = Array.from({ length: 78 }, (_, i) => i);
  const cards = Array.from({ length: input.count }, (_, i) => {
    const pick = i + randomInt(78 - i);
    [ids[i], ids[pick]] = [ids[pick], ids[i]];
    return {
      ...tarotDeck[ids[i]],
      reversed: input.reversals && randomInt(2) === 1,
      position: input.count === 1 ? 'reflection' : ['situation', 'tension', 'next-step'][i],
    };
  });
  return {
    kind: 'tarot' as const,
    version: 'wenbu-tarot-1.0',
    cards,
    method: {
      name: 'cryptographic-without-replacement',
      deckSize: 78,
      reversals: input.reversals,
      spread: input.count === 1 ? 'one-card' : 'situation-tension-next-step',
      source: 'https://www.gutenberg.org/ebooks/43548',
      note: 'Original interpretive prompts in the Rider–Waite–Smith tradition. No prediction, third-party deck artwork or copied translation.',
    },
  };
}
export type TarotResult = ReturnType<typeof drawTarot>;
