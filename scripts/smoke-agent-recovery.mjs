import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

// Opt-in real DeepSeek smoke, synthetic drafts only. Counts against normal quotas.
const base = process.env.WENBU_URL || 'https://wenbu.app';
const path = process.env.WENBU_EVIDENCE || 'output/playwright/agent-recovery-live.json';
const locales = (process.env.WENBU_LOCALES || 'zh,en').split(',');
const evidence = { base, checkedAt: new Date().toISOString(), synthetic: true, turns: [] };
try {
  for (const locale of locales) {
    assert(['zh', 'en'].includes(locale));
    const draft = {
      title: locale === 'zh' ? '真太阳时：两条规则' : 'Solar time: two rules',
      summary:
        locale === 'zh'
          ? '区分出生时刻与排盘采用的当地钟面时间。'
          : 'Distinguish the birth instant from the local clock used in a chart.',
      sections: [
        {
          heading: locale === 'zh' ? '核对约定' : 'Check the conventions',
          body:
            locale === 'zh'
              ? '真太阳时校正只用于日柱与时柱，年柱和月柱仍按同一绝对时刻的节气边界判定。需要写明时区和换日约定。'
              : 'Solar-time correction applies to the day and hour. Year and month use solar-term boundaries at the same absolute instant. State the timezone and day boundary.',
          sourceIds: ['guide-birth-time-timezone', 'guide-bazi-basics'],
        },
      ],
      questions: [],
    };
    const response = await fetch(base + '/api/v1/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: base, 'X-Wenbu-Test': 'true' },
      body: JSON.stringify({
        message:
          locale === 'zh'
            ? '这是虚构资料的质量测试。把上一份报告改为两段简短说明，标题仍用「真太阳时：两条规则」。根据知识手册核实说法，保留已核对的出处和计算约定，保存新报告。无需排盘或补充个人资料。'
            : 'This is a synthetic quality test. Revise the previous report into two short paragraphs titled “Solar time: two rules”. Check its claims against the handbook, retain verified citations and calculation conventions, and save the revised report. No personal intake or chart calculation is needed.',
        locale,
        mode: 'research',
        consent: true,
        context: { reports: [draft], sourceIds: draft.sections[0].sourceIds },
      }),
      signal: AbortSignal.timeout(150000),
    });
    assert.equal(response.status, 200, `HTTP ${response.status}`);
    const body = await response.text();
    const events = body.split(/\r?\n\r?\n/).flatMap((block) => {
      const data = block
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('\n');
      return data && data !== '[DONE]' ? [JSON.parse(data)] : [];
    });
    evidence.turns.push({ locale, events });
    assert(!events.some((event) => event.type === 'error'), 'Terminal agent error');
    assert(
      !events.some((event) => event.type === 'tool_end' && event.issue === 'citation_unread'),
      'Prior citations should be prepared before the first report attempt',
    );
    const recovered = new Set(
      events.filter((event) => event.type === 'tool_recovered').map((event) => event.id),
    );
    assert(
      !events.some(
        (event) => event.type === 'tool_end' && event.status === 'error' && !recovered.has(event.id),
      ),
      'Unresolved tool failure',
    );
    assert(events.some((event) => event.type === 'done' && event.status === 'complete'));
    const reports = events.filter((event) => event.type === 'artifact' && event.artifact.type === 'report');
    assert(reports.length > 0, 'No report artifact');
    assert(
      reports.every((event) => event.artifact.sections.some((section) => section.sourceIds.length)),
      'Report lost all citations',
    );
    for (const id of draft.sections[0].sourceIds)
      assert(events.some((event) => event.type === 'source' && event.source.id === id));
    const text = events
      .filter((event) => event.type === 'delta')
      .map((event) => event.text)
      .join('')
      .trim();
    assert(text.length > 25, 'Missing conversational summary');
    assert(!/(?:三点提要|Key takeaways)\s*[:：]$/i.test(text), 'Dangling summary heading');
    console.log(JSON.stringify({ locale, result: 'passed', done: events.at(-1) }));
  }
  evidence.result = 'passed';
} catch (error) {
  evidence.result = 'failed';
  evidence.error = String(error);
  process.exitCode = 1;
} finally {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify({ base, result: evidence.result, evidence: path, error: evidence.error }));
}
