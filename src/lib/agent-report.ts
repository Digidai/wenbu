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
