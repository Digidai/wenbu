import type { Reading } from './tools';
import type { Answer } from './journal';
import type { Locale } from './schema';
export function readingExcerpt(reading: Reading, question: string, locale: Locale) {
  const zh = locale === 'zh',
    lines = question.trim() ? [(zh ? '问题：' : 'Question: ') + question.trim(), ''] : [];
  if (reading.kind === 'tarot') {
    lines.push(zh ? '塔罗抽牌' : 'Tarot draw');
    for (const [i, c] of reading.cards.entries())
      lines.push(
        `${i + 1}. ${zh ? c.zh : c.en} · ${zh ? (c.reversed ? '逆位' : '正位') : c.reversed ? 'Reversed' : 'Upright'}`,
      );
    lines.push(
      zh
        ? '牌序：当下 / 牵引 / 下一步（单张只看当下）'
        : 'Positions: situation / tension / next step (one card: situation only)',
    );
  } else if (reading.kind === 'iching') {
    lines.push(
      zh ? '易经问卦' : 'I Ching reading',
      `${reading.original.zh} → ${reading.changed.zh}`,
      `${zh ? '六爻（由下往上）' : 'Lines (bottom to top)'}: ${reading.lines.join(', ')}`,
      `${zh ? '动爻' : 'Moving lines'}: ${reading.moving.join(', ') || '—'}`,
    );
  } else if (reading.kind === 'bazi') {
    lines.push(
      zh ? '八字命盘' : 'BaZi chart',
      `${reading.input.date} ${reading.input.time ?? (zh ? '时间未知' : 'Time unknown')} · ${reading.input.timezone}`,
      reading.pillars.map((p) => `${p.key}: ${p.value ?? '—'}`).join(' / '),
      `${zh ? '换日规则' : 'Day boundary'}: ${reading.input.dayBoundary}`,
      `${zh ? '真太阳时修正（分钟）' : 'Solar correction (minutes)'}: ${reading.calendar.correctionMinutes}`,
      ...reading.warnings,
    );
  } else {
    lines.push(
      zh ? '紫微星盘' : 'Zi Wei chart',
      `${reading.input.date} ${reading.input.time} · ${reading.input.sex}`,
      `${reading.lunarDate} · ${reading.fiveElementsClass}`,
      ...reading.palaces.map(
        (p) =>
          `${p.name}: ${p.stars.map((s) => s.name + (s.mutagen ? ' · ' + s.mutagen : '')).join(', ') || '—'}`,
      ),
    );
  }
  return lines.join('\n').slice(0, 8000);
}
export function answerExcerpt(answer: Answer, question: string) {
  return [
    question,
    '',
    answer.title,
    answer.summary,
    ...answer.observations.map((o) => `${o.basis}\n${o.reflection}`),
    ...answer.nextSteps,
    answer.question,
  ]
    .join('\n\n')
    .slice(0, 8000);
}
