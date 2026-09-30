import { useEffect, useMemo, useState } from 'react';
import { castIching } from '../lib/iching';
import type { Locale } from '../lib/schema';
const initial = [6, 7, 8, 9, 7, 8];
export default function HexagramLesson({ locale }: { locale: Locale }) {
  const [lines, setLines] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const changed = lines.some((v, i) => v !== initial[i]);
  const r = useMemo(() => castIching({ lines }), [lines]);
  const t = (zh: string, en: string) => (locale === 'zh' ? zh : en);
  return (
    <div className="line-lesson">
      <p className="lesson-instruction">
        {t(
          '点一条爻，在 6 → 7 → 8 → 9 之间切换。练习只改变下方图解，不会起新卦或保存记录。',
          'Select a line to cycle through 6 → 7 → 8 → 9. This changes only the teaching diagram; it does not cast or save a reading.',
        )}
      </p>
      <div className="line-pair">
        <div>
          <strong>{t('本卦', 'Original')}</strong>
          <div className="line-stack">
            {[5, 4, 3, 2, 1, 0].map((i) => (
              <button
                key={i}
                type="button"
                disabled={!ready}
                onClick={() => setLines((old) => old.map((v, j) => (j === i ? (v === 9 ? 6 : v + 1) : v)))}
                aria-label={t(
                  `第 ${i + 1} 爻，${lines[i]}，${lines[i] % 2 ? '阳' : '阴'}${[6, 9].includes(lines[i]) ? '，动爻' : ''}，点击更改`,
                  `Line ${i + 1}: ${lines[i]}, ${lines[i] % 2 ? 'yang' : 'yin'}${[6, 9].includes(lines[i]) ? ', changing' : ''}. Select to change.`,
                )}
                className={[
                  'lesson-line',
                  lines[i] % 2 ? 'yang' : 'yin',
                  [6, 9].includes(lines[i]) ? 'moving' : '',
                ].join(' ')}
              >
                <span>{i + 1}</span>
                <i aria-hidden="true" />
                <i aria-hidden="true" />
                <span>{lines[i]}</span>
              </button>
            ))}
          </div>
        </div>
        <span className="lesson-arrow" aria-hidden="true">
          →
        </span>
        <div>
          <strong>{t('之卦', 'Resulting')}</strong>
          <div className="line-stack">
            {[5, 4, 3, 2, 1, 0].map((i) => (
              <div key={i} className={`lesson-line ${r.changed.bits[i] === '1' ? 'yang' : 'yin'}`}>
                <span>{i + 1}</span>
                <i />
                <i />
                <span>{r.changed.bits[i] === '1' ? '⚊' : '⚋'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="lesson-result" aria-live="polite">
        {r.original.number} · {locale === 'zh' ? r.original.zh : r.original.en} → {r.changed.number} ·{' '}
        {locale === 'zh' ? r.changed.zh : r.changed.en}
        <br />
        <small>
          {changed &&
            t('当前演示已修改；正文案例保持原样。 ', 'Diagram changed; the written example stays fixed. ')}
          {t('朱色为动爻；第 1 爻在最下方。', 'Vermilion marks changing lines. Line 1 is at the bottom.')}
        </small>
      </p>
      <button className="text-link" disabled={!ready} type="button" onClick={() => setLines(initial)}>
        {t('恢复文中示例', 'Reset the worked example')} ↺
      </button>
    </div>
  );
}
