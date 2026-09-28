import { describe, expect, it } from 'vitest';
import { readReportVisual, reportSourceIds, reportVisualSchema } from '../src/lib/agent-report';
import { agentRequestSchema, reportSchema } from '../worker/agent-schema';
import { executeAgentTool } from '../worker/agent-tools';
import { artifactMarkdown } from '../src/lib/agent-session';
import type { AgentEvent, AgentSource, ReportArtifact } from '../src/lib/agent-protocol';

const draft = {
  title: 'Two conventions',
  summary: 'Only the stated boundary differs; this is not a prediction.',
  sections: [{ heading: 'Details', body: 'Use the documented convention.', sourceIds: [] }],
  questions: [],
};
const visual = {
  type: 'comparison' as const,
  title: 'Day boundaries',
  items: [
    { label: 'Midnight', detail: 'The date changes at midnight.', sourceIds: ['read-source'] },
    { label: 'Early Zi', detail: 'The date changes at 23:00.', sourceIds: ['read-source'] },
  ],
  note: 'Only compare with the convention stated explicitly.',
};
const source: AgentSource = {
  id: 'read-source',
  title: 'Read source',
  url: 'https://example.com/source',
  kind: 'reference',
  level: 'reference',
  excerpt: 'Source excerpt',
  readAt: '2026-09-28',
};

describe('semantic report diagrams', () => {
  it('keeps legacy reports compatible and ignores malformed optional visual data for display', () => {
    expect(reportSchema.parse(draft)).toEqual(draft);
    expect(readReportVisual(undefined)).toBeUndefined();
    for (const value of [
      { ...visual, items: null },
      { ...visual, type: 'confidence' },
      { ...visual, html: '<script>' },
    ]) {
      expect(readReportVisual(value)).toBeUndefined();
    }
  });
  it('bounds each item, the number of items and the total report budget', () => {
    expect(reportVisualSchema.safeParse({ ...visual, items: [visual.items[0]] }).success).toBe(false);
    expect(reportVisualSchema.safeParse({ ...visual, items: Array(5).fill(visual.items[0]) }).success).toBe(
      false,
    );
    expect(
      reportVisualSchema.safeParse({
        ...visual,
        items: [{ ...visual.items[0], detail: 'a'.repeat(161) }, visual.items[1]],
      }).success,
    ).toBe(false);
    const long = {
      ...draft,
      summary: 'a'.repeat(450),
      sections: [
        { heading: 'one', body: 'a'.repeat(700), sourceIds: [] },
        { heading: 'two', body: 'b'.repeat(550), sourceIds: [] },
      ],
      visual,
    };
    expect(reportSchema.safeParse(long).success).toBe(false);
  });
  it('rejects unread citations used only by the visual before emitting any artifact', async () => {
    const received: AgentEvent[] = [];
    const ctx = {
      locale: 'en' as const,
      signal: new AbortController().signal,
      emit: (event: AgentEvent) => received.push(event),
      sources: new Map<string, AgentSource>(),
    };
    await expect(executeAgentTool('write_report', { ...draft, visual }, ctx)).rejects.toThrow(
      'A citation was not read or verified',
    );
    expect(received).toEqual([]);
    ctx.sources.set(source.id, source);
    await executeAgentTool('write_report', { ...draft, visual }, ctx);
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ type: 'artifact', artifact: { visual } });
  });
  it('retains diagram-only citations, qualifiers and sequence in export and follow-up context', () => {
    const report: ReportArtifact = {
      ...draft,
      visual: { ...visual, type: 'steps' },
      type: 'report',
      id: 'test',
      createdAt: '2026-09-28',
    };
    const markdown = artifactMarkdown(report, [source]);
    expect(markdown).toContain('1. **Midnight**: The date changes at midnight\\.');
    expect(markdown).toContain('Only compare with the convention stated explicitly\\.');
    expect(markdown).toContain('Sources / 依据: [Read source](<https://example.com/source>)');
    expect(markdown).toContain('[Read source](<https://example.com/source>)');
    expect(reportSourceIds(report)).toEqual(['read-source']);
    const { type: _type, id: _id, createdAt: _createdAt, ...contextReport } = report;
    const parsed = agentRequestSchema.parse({
      message: 'Revise the diagram',
      consent: true,
      context: { reports: [contextReport] },
    });
    expect(parsed.context.reports[0].visual).toEqual(report.visual);
  });
  it('exports plain diagram labels without introducing Markdown structure or losing item provenance', () => {
    const report: ReportArtifact = {
      ...draft,
      type: 'report',
      id: 'test',
      createdAt: '2026-09-28',
      visual: {
        ...visual,
        title: 'Title\n# injected',
        items: [
          { ...visual.items[0], label: '[label](https://wrong.example)', detail: '**literal**\n## heading' },
          visual.items[1],
        ],
      },
    };
    const markdown = artifactMarkdown(report, [source]);
    expect(markdown).not.toContain('\n# injected');
    expect(markdown).toContain('\\*\\*literal\\*\\* \\#\\# heading');
    expect(markdown.match(/Sources \/ 依据:/g)).toHaveLength(2);
  });
  it('preserves missing section citations and literal headings in the exported document', () => {
    const report: ReportArtifact = {
      ...draft,
      type: 'report',
      id: 'test',
      createdAt: '2026-09-28',
      title: 'Title\n# untrusted',
      sections: [
        {
          heading: 'A [literal] heading',
          body: '**Intended Markdown**',
          sourceIds: ['read-source', 'missing'],
        },
      ],
    };
    const markdown = artifactMarkdown(report, [
      { ...source, title: 'Source ] title', url: 'https://example.com/source_(a)' },
    ]);
    expect(markdown).not.toContain('\n# untrusted');
    expect(markdown).toContain('## A \\[literal\\] heading');
    expect(markdown).toContain('**Intended Markdown**');
    expect(markdown).toContain(
      'Sources / 依据: [Source \\] title](<https://example.com/source_(a)>); Unresolved citation / 引用未匹配',
    );
    expect(markdown).toContain('- [Source \\] title](<https://example.com/source_(a)>)');
  });
});
