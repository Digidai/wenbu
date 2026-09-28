Read-only closure review; do not use tools or delegate. The previous review identified export plain-text escaping/per-item citations, unresolved citation labeling, sequence accessibility, and malformed optional visuals in follow-up context. Those were repaired. Check actual remaining defects in the supplied final source. The outer result already had key={artifact.id}; AgentReport now also has key={artifact.id}. The context map now sends visual: readReportVisual(visual). New failures/stops explicitly open the trace, but user disclosure choice is stateful. At <=360px comparisons stack, while 390px was visually checked side-by-side. State scope; do not claim tests/browser work. Return concise findings or no remaining actionable findings.

## src/components/AgentTrace.tsx
```tsx
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, CircleAlert, CirclePause } from 'lucide-react';
import type { AgentMessage } from '../lib/agent-protocol';
import type { Locale } from '../lib/schema';
import InstrumentGlyph, { type InstrumentKind } from './InstrumentGlyph';

const groups: { names: string[]; icon: InstrumentKind; zh: string; en: string }[] = [
  { names: ['search_library', 'read_library', 'read_reference'], icon: 'library', zh: '查阅', en: 'Read' },
  {
    names: ['calculate_bazi', 'calculate_ziwei', 'cast_iching', 'draw_tarot'],
    icon: 'bazi',
    zh: '推演',
    en: 'Calculate',
  },
  { names: ['write_report'], icon: 'report', zh: '成稿', en: 'Write' },
  { names: ['ask_user'], icon: 'library', zh: '补充', en: 'Clarify' },
];

export default function AgentTrace({
  message,
  locale,
  children,
}: {
  message: AgentMessage;
  locale: Locale;
  children: ReactNode;
}) {
  const tools = message.tools.filter((tool) => tool.name !== 'update_plan');
  const failed = tools.filter((tool) => tool.status === 'error').length;
  const stopped = tools.filter((tool) => tool.status === 'stopped').length;
  const exceptions = failed + stopped;
  const [open, setOpen] = useState(exceptions > 0);
  const priorExceptions = useRef(exceptions);
  useEffect(() => {
    if (exceptions > priorExceptions.current) setOpen(true);
    priorExceptions.current = exceptions;
  }, [exceptions]);
  if (!tools.length) return null;
  const zh = locale === 'zh';
  return (
    <details className="agent-trace" open={open}>
      <summary
        onClick={(event) => {
          event.preventDefault();
          setOpen((value) => !value);
        }}
      >
        <span className="trace-route">
          {groups.map((group) => {
            const matches = tools.filter((tool) => group.names.includes(tool.name));
            if (!matches.length) return null;
            const running = message.status === 'running' && matches.some((tool) => tool.status === 'running');
            return (
              <span className={`trace-station ${running ? 'is-running' : ''}`} key={group.en}>
                <InstrumentGlyph kind={group.icon} size={27} />
                <span>
                  {zh ? group.zh : group.en}
                  <small> × {matches.length}</small>
                </span>
              </span>
            );
          })}
        </span>
        <span className="trace-disclosure">
          {zh ? '过程' : 'Activity'}
          <ChevronDown size={13} />
        </span>
        {(failed > 0 || stopped > 0) && (
          <span className="trace-exceptions">
            {failed > 0 && (
              <span>
                <CircleAlert size={12} />
                {zh ? `${failed} 次未成功` : `${failed} failed attempt${failed === 1 ? '' : 's'}`}
              </span>
            )}
            {stopped > 0 && (
              <span>
                <CirclePause size={12} />
                {zh ? `${stopped} 次已停止` : `${stopped} stopped`}
              </span>
            )}
          </span>
        )}
      </summary>
      <div className="agent-tool-log" aria-label={zh ? '实际执行记录' : 'Execution activity'}>
        {children}
      </div>
    </details>
  );
}

```

## src/components/AgentReport.tsx
```tsx
import { useId, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  GitCompareArrows,
  ListOrdered,
  ScrollText,
} from 'lucide-react';
import type { ReportArtifact, AgentSource } from '../lib/agent-protocol';
import { readReportVisual, reportSourceIds, type ReportVisual } from '../lib/agent-report';
import type { Locale } from '../lib/schema';
import AgentMarkdown from './AgentMarkdown';
import InstrumentGlyph from './InstrumentGlyph';

function Citations({ ids, sources, locale }: { ids: string[]; sources: AgentSource[]; locale: Locale }) {
  const cited = sources.filter((source) => ids.includes(source.id));
  const missing = [...new Set(ids)].filter((id) => !sources.some((source) => source.id === id)).length;
  return (
    <div className="visual-citations">
      <BookOpen size={12} aria-hidden="true" />
      {cited.length > 0 &&
        cited.map((source) => (
          <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">
            {source.title}
            <ArrowUpRight size={11} />
          </a>
        ))}
      {!ids.length && (
        <span>
          {locale === 'zh'
            ? '本项未附来源，请结合正文判断'
            : 'No source attached to this item; consult the note'}
        </span>
      )}
      {missing > 0 && (
        <span className="citation-unavailable">
          {locale === 'zh'
            ? `${missing} 处引用未能匹配已读资料`
            : `${missing} citation${missing === 1 ? '' : 's'} could not be matched to a read source`}
        </span>
      )}
    </div>
  );
}

function ReportDiagram({
  visual,
  sources,
  locale,
}: {
  visual: ReportVisual;
  sources: AgentSource[];
  locale: Locale;
}) {
  const [selected, setSelected] = useState(0);
  const captionId = useId();
  const zh = locale === 'zh';
  const comparison = visual.type === 'comparison';
  const selectedIndex = selected < visual.items.length ? selected : 0;
  return (
    <figure className={`report-diagram diagram-${visual.type}`}>
      <figcaption>
        {comparison ? <GitCompareArrows size={16} /> : <ListOrdered size={16} />}
        <span>{visual.title}</span>
        <small>{comparison ? (zh ? '对照' : 'COMPARE') : zh ? '步骤' : 'SEQUENCE'}</small>
      </figcaption>
      <div className="diagram-items" role="group" aria-label={visual.title}>
        {visual.items.map((item, index) => (
          <button
            key={index}
            type="button"
            aria-pressed={selectedIndex === index}
            aria-label={
              !comparison
                ? `${index + 1}. ${item.label}. ${item.detail}. ${zh ? '查看依据' : 'View sources'}`
                : undefined
            }
            aria-controls={captionId}
            onClick={() => setSelected(index)}
          >
            <span className="diagram-node" aria-hidden="true">
              {comparison ? (
                <svg viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" />
                  <path d={index % 2 ? 'M16 4a12 12 0 0 1 0 24z' : 'M16 4a12 12 0 0 0 0 24z'} />
                </svg>
              ) : (
                String(index + 1).padStart(2, '0')
              )}
            </span>
            <span className="diagram-item-copy">
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </span>
            <span className="diagram-source-hint">
              <BookOpen size={10} />
              {zh ? '查看依据' : 'Sources'}
              <ArrowRight size={10} />
            </span>
          </button>
        ))}
      </div>
      {visual.note && <p className="diagram-note">{visual.note}</p>}
      <div className="diagram-evidence" id={captionId} aria-live="polite" aria-atomic="true">
        <span>
          {zh
            ? `${visual.items[selectedIndex].label} · 依据`
            : `${visual.items[selectedIndex].label} · sources`}
        </span>
        <Citations ids={visual.items[selectedIndex].sourceIds} sources={sources} locale={locale} />
      </div>
    </figure>
  );
}

export default function AgentReport({
  report,
  sources,
  locale,
  busy,
  onQuestion,
}: {
  report: ReportArtifact;
  sources: AgentSource[];
  locale: Locale;
  busy: boolean;
  onQuestion: (question: string) => void;
}) {
  const [expanded, setExpanded] = useState<number[]>([0]);
  const visual = readReportVisual(report.visual);
  const ids = reportSourceIds(report);
  const sourceCount = sources.filter((source) => ids.includes(source.id)).length;
  const allExpanded = expanded.length === report.sections.length;
  const zh = locale === 'zh';
  return (
    <div className="agent-report visual-report">
      <div className="report-overview">
        <InstrumentGlyph kind="report" size={52} />
        <div>
          <span>{zh ? '这份札记' : 'IN THIS NOTE'}</span>
          <div className="report-overview-counts">
            <span>
              <b>{report.sections.length}</b>
              {zh ? '个章节' : 'sections'}
            </span>
            <span>
              <b>{sourceCount}</b>
              {zh ? '份引用资料' : 'cited sources'}
            </span>
            {visual && (
              <span>
                <b>1</b>
                {zh ? '幅图解' : 'diagram'}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="agent-report-summary">{report.summary}</p>
      {visual && <ReportDiagram visual={visual} sources={sources} locale={locale} />}
      <div className="report-chapters-heading">
        <span>
          <ScrollText size={14} />
          {zh ? '展开细读' : 'READ THE NOTE'}
        </span>
        <button
          type="button"
          onClick={() => setExpanded(allExpanded ? [] : report.sections.map((_, index) => index))}
        >
          {allExpanded ? (zh ? '收起全文' : 'Collapse all') : zh ? '展开全文' : 'Expand all'}
        </button>
      </div>
      <div className="report-chapters">
        {report.sections.map((section, index) => (
          <details key={index} className="report-chapter" open={expanded.includes(index)}>
            <summary
              onClick={(event) => {
                event.preventDefault();
                setExpanded((current) =>
                  current.includes(index) ? current.filter((value) => value !== index) : [...current, index],
                );
              }}
            >
              <span className="chapter-index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{section.heading}</h3>
              <ChevronDown size={14} />
            </summary>
            <div className="chapter-body">
              <div className="agent-prose">
                <AgentMarkdown text={section.body} allowedUrls={sources.map((source) => source.url)} />
              </div>
              <Citations ids={section.sourceIds} sources={sources} locale={locale} />
            </div>
          </details>
        ))}
      </div>
      {report.questions.length > 0 && (
        <div className="agent-report-questions">
          <span className="eyebrow">{zh ? '把问题留给下一步' : 'KEEP EXPLORING'}</span>
          {report.questions.map((question) => (
            <button key={question} disabled={busy} onClick={() => onQuestion(question)}>
              {question}
              <ArrowUpRight size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

```

## src/lib/agent-report.ts
```tsx
import { z } from 'zod';
import type { ReportArtifact } from './agent-protocol';

// A bounded semantic diagram, never arbitrary HTML, chart code or confidence scores.
export const reportVisualSchema = z
  .object({
    type: z.enum(['comparison', 'steps']),
    title: z.string().trim().min(1).max(80),
    items: z
      .array(
        z
          .object({
            label: z.string().trim().min(1).max(48),
            detail: z.string().trim().min(1).max(160),
            sourceIds: z.array(z.string().min(1).max(120)).max(4).default([]),
          })
          .strict(),
      )
      .min(2)
      .max(4),
    note: z.string().max(160).default(''),
  })
  .strict();

export type ReportVisual = z.infer<typeof reportVisualSchema>;

export function readReportVisual(value: unknown): ReportVisual | undefined {
  const result = reportVisualSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function reportSourceIds(report: Pick<ReportArtifact, 'sections' | 'visual'>): string[] {
  const visual = readReportVisual(report.visual);
  return [
    ...new Set([
      ...report.sections.flatMap((section) => section.sourceIds),
      ...(visual?.items.flatMap((item) => item.sourceIds) ?? []),
    ]),
  ];
}

```

## Export implementation
```ts
function markdownText(text: string) {
  return text.replace(/[\r\n]+/g, ' ').replace(/[\\`*_[\]{}<>#+.!|()\-]/g, '\\$&');
}
function markdownCitation(source: { title: string; url: string }) {
  return `[${markdownText(source.title)}](<${source.url.replace(/[<>\s\\]/g, (char) => encodeURIComponent(char))}>)`;
}
export function artifactMarkdown(
  artifact: AgentArtifact,
  sources: { id: string; title: string; url: string }[],
) {
  if (artifact.type === 'chart')
    return `# ${artifact.title}\n\n\`\`\`json\n${JSON.stringify(artifact.reading, null, 2)}\n\`\`\`\n`;
  const ids = new Set(reportSourceIds(artifact));
  const visual = readReportVisual(artifact.visual);
  return (
    `# ${artifact.title}\n\n${artifact.summary}\n\n` +
    (visual
      ? `## ${markdownText(visual.title)}\n\n` +
        visual.items
          .map((item, index) => {
            const cited = [...new Set(item.sourceIds)].map((id) => {
              const source = sources.find((value) => value.id === id);
              return source ? markdownCitation(source) : 'Unresolved citation / 引用未匹配';
            });
            return (
              `${visual.type === 'steps' ? `${index + 1}.` : '-'} **${markdownText(item.label)}**: ${markdownText(item.detail)}` +
              (cited.length ? `\n   Sources / 依据: ${cited.join('; ')}` : '')
            );
          })
          .join('\n') +
        (visual.note ? `\n\n${markdownText(visual.note)}` : '') +
        '\n\n'
      : '') +
    artifact.sections.map((s) => `## ${s.heading}\n\n${s.body}`).join('\n\n') +
    (artifact.questions.length
      ? '\n\n## ' + 'Questions / 继续思考\n\n' + artifact.questions.map((q) => '- ' + q).join('\n')
      : '') +
    '\n\n## Sources / 参考资料\n\n' +
    sources
      .filter((s) => ids.has(s.id))
      .map((s) => `- [${s.title}](${s.url})`)
      .join('\n') +
    '\n\nGenerated with DeepSeek · Wenbu · Symbolic interpretation, not established prediction.\n'
  );
}

```
