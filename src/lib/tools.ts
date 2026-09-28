import { calculateBazi } from './bazi';
import { castIching } from './iching';
import { drawTarot } from './tarot';
import { calculateZiwei } from './ziwei';
import type { ToolKind } from './schema';
export const calculators = {
  bazi: calculateBazi,
  iching: castIching,
  tarot: drawTarot,
  ziwei: calculateZiwei,
};
export function calculate(kind: ToolKind, input: unknown) {
  return calculators[kind](input);
}
export type Reading = ReturnType<typeof calculate>;
