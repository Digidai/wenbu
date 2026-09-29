import { z } from 'zod';
import {
  feedbackCategories,
  feedbackRatings,
  feedbackStates,
  feedbackLimits,
} from '../src/lib/feedback-contract';
import { analyticsRelease, safePage, tools } from '../src/lib/analytics-contract';
import { requestContext } from './analytics';
import { ApiError } from './ai';
import type { Env } from './types';

export const feedbackSchema = z
  .object({
    id: z.uuid(),
    page: z.string().max(120).transform(safePage),
    locale: z.enum(['zh', 'en']),
    tool: z.enum(tools).default('none'),
    category: z.enum(feedbackCategories),
    rating: z.enum(feedbackRatings).default('none'),
    message: z.string().trim().max(feedbackLimits.message).default(''),
    contact: z.union([z.literal(''), z.email().max(feedbackLimits.contact)]).default(''),
    shareContext: z.boolean().default(false),
    excerpt: z.string().max(feedbackLimits.context).default(''),
  })
  .strict()
  .refine((v) => v.message.length > 0 || v.rating !== 'none', { message: 'Add a note or a rating.' })
  .refine((v) => v.shareContext || v.excerpt === '', { message: 'Context requires explicit consent.' });

export async function sha256(value: string) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))),
    (b) => b.toString(16).padStart(2, '0'),
  ).join('');
}
export async function submitFeedback(raw: unknown, request: Request, env: Env) {
  if (!env.ANALYTICS) throw new ApiError(503, 'feedback_unavailable', 'Feedback is temporarily unavailable.');
  const f = feedbackSchema.parse(raw);
  const hash = await sha256(JSON.stringify(f));
  const context = requestContext(request);
  const now = Date.now();
  await env.ANALYTICS.prepare(
    `INSERT OR IGNORE INTO feedback
    (id,created_at,updated_at,category,rating,message,contact,context_excerpt,share_context,payload_hash,page,locale,tool,session_id,visitor_id,operation_id,conversation_id,release,is_test)
    VALUES (${Array(19).fill('?').join(',')})`,
  )
    .bind(
      f.id,
      now,
      now,
      f.category,
      f.rating,
      f.message,
      f.contact,
      f.excerpt,
      Number(f.shareContext),
      hash,
      f.page,
      f.locale,
      f.tool,
      context?.session ?? null,
      context?.visitor ?? null,
      context?.operation ?? null,
      context?.conversation ?? null,
      analyticsRelease,
      Number(context?.test ?? request.headers.get('X-Wenbu-Test') === 'true'),
    )
    .run();
  const rows = await env.ANALYTICS.prepare('SELECT payload_hash FROM feedback WHERE id=?')
    .bind(f.id)
    .all<{ payload_hash: string }>();
  if (rows.results[0]?.payload_hash !== hash)
    throw new ApiError(409, 'feedback_conflict', 'This receipt belongs to a different submission.');
  return { id: f.id, saved: true };
}
export async function updateFeedback(id: string, raw: unknown, env: Env) {
  const change = z
    .object({ state: z.enum(feedbackStates), revision: z.number().int().positive() })
    .strict()
    .parse(raw);
  const result = await env
    .ANALYTICS!.prepare(
      'UPDATE feedback SET state=?,updated_at=?,revision=revision+1 WHERE id=? AND revision=?',
    )
    .bind(change.state, Date.now(), z.uuid().parse(id), change.revision)
    .run();
  if (!result.meta.changes)
    throw new ApiError(409, 'revision_conflict', 'Feedback changed. Refresh before updating.');
  return { saved: true, revision: change.revision + 1 };
}
