import { z } from 'zod';
import type { Env } from './types';
import {
  actions,
  campaigns,
  clientEvents,
  mediums,
  safePage,
  sources,
  statuses,
  tools,
} from '../src/lib/analytics-contract';

const contextSchema = z
  .object({
    session: z.uuid(),
    visitor: z.uuid(),
    page: z.string().max(120).transform(safePage),
    entry: z.string().max(120).transform(safePage),
    locale: z.enum(['zh', 'en']),
    source: z.enum(sources),
    medium: z.enum(mediums),
    campaign: z.enum(campaigns),
    test: z.boolean().default(false),
  })
  .strict();
export const eventSchema = contextSchema
  .extend({
    id: z.uuid(),
    event: z.enum(clientEvents),
    tool: z.enum(tools).default('none'),
    mode: z.enum(['none', 'explore', 'research']).default('none'),
    action: z.enum(actions).default('none'),
    status: z.enum(statuses).default('none'),
    value: z.number().int().min(0).max(100).default(0),
    duration: z.number().int().min(0).max(3600000).default(0),
  })
  .strict();
export const eventBatch = z.object({ events: z.array(eventSchema).min(1).max(10) }).strict();
export type ServiceMetric = {
  event: 'calculation_succeeded' | 'interpret_succeeded' | 'agent_finished' | 'api_failed' | 'mcp_finished';
  tool: (typeof tools)[number];
  status: (typeof statuses)[number];
  mode?: 'none' | 'explore' | 'research';
  locale?: 'zh' | 'en';
  duration: number;
  modelCalls?: number;
  toolCalls?: number;
  artifacts?: number;
};

export function requestDimensions(request: Request) {
  const ua = request.headers.get('User-Agent') ?? '';
  return {
    device: /bot|crawler|spider|headless/i.test(ua)
      ? 'bot'
      : /iPad|Tablet/i.test(ua)
        ? 'tablet'
        : /Mobi|Android/i.test(ua)
          ? 'mobile'
          : ua
            ? 'desktop'
            : 'unknown',
    browser: /Edg\//.test(ua)
      ? 'edge'
      : /Firefox\//.test(ua)
        ? 'firefox'
        : /Chrome\//.test(ua)
          ? 'chrome'
          : /Safari\//.test(ua)
            ? 'safari'
            : 'other',
    os: /iPhone|iPad/.test(ua)
      ? 'ios'
      : /Android/.test(ua)
        ? 'android'
        : /Windows/.test(ua)
          ? 'windows'
          : /Macintosh/.test(ua)
            ? 'macos'
            : /Linux/.test(ua)
              ? 'linux'
              : 'other',
    country: /^[A-Z]{2}$/.test(String(request.cf?.country ?? '')) ? String(request.cf?.country) : 'XX',
  };
}
const columns =
  'id,occurred_at,event,origin,session_id,visitor_id,page,entry_page,locale,source,medium,campaign,device,browser,os,country,channel,tool,mode,action,status,value,duration_ms,model_calls,tool_calls,artifacts,is_test';
const insert = `INSERT OR IGNORE INTO events (${columns}) VALUES (${Array(27).fill('?').join(',')})`;
const noTracking = (request: Request) =>
  request.headers.get('DNT') === '1' ||
  request.headers.get('Sec-GPC') === '1' ||
  request.headers.get('X-Wenbu-Analytics') === 'off';
export async function collectEvents(raw: unknown, request: Request, env: Env) {
  const { events } = eventBatch.parse(raw);
  if (noTracking(request)) return { accepted: 0 };
  if (!env.ANALYTICS) throw new Error('Analytics unavailable');
  const meta = requestDimensions(request);
  const result = await env.ANALYTICS.batch(
    events.map((e) =>
      env
        .ANALYTICS!.prepare(insert)
        .bind(
          e.id,
          Date.now(),
          e.event,
          'client',
          e.session,
          e.visitor,
          e.page,
          e.entry,
          e.locale,
          e.source,
          e.medium,
          e.campaign,
          meta.device,
          meta.browser,
          meta.os,
          meta.country,
          'web',
          e.tool,
          e.mode,
          e.action,
          e.status,
          e.value,
          e.duration,
          0,
          0,
          0,
          Number(e.test),
        ),
    ),
  );
  return { accepted: result.reduce((n, r) => n + (r.meta.changes ?? 0), 0) };
}
export async function recordService(request: Request, env: Env, metric: ServiceMetric) {
  if (!env.ANALYTICS || noTracking(request)) return;
  let context: z.infer<typeof contextSchema> | undefined;
  // Public correlation labels are approximate product analytics, never billing identity.
  const header = request.headers.get('X-Wenbu-Analytics');
  if (header && header.length <= 1500) {
    try {
      context = contextSchema.parse(JSON.parse(header));
    } catch {
      /* Discard the entire untrusted context. */
    }
  }
  const meta = requestDimensions(request);
  const path = new URL(request.url).pathname;
  const channel = path.startsWith('/mcp')
    ? 'mcp'
    : request.headers.get('X-Wenbu-Client') === 'cli'
      ? 'cli'
      : context || request.headers.get('X-Wenbu-Client') === 'web'
        ? 'web'
        : 'api';
  await env.ANALYTICS.prepare(insert)
    .bind(
      crypto.randomUUID(),
      Date.now(),
      metric.event,
      'server',
      context?.session ?? null,
      context?.visitor ?? null,
      context?.page ?? '/api/',
      context?.entry ?? '/api/',
      context?.locale ?? metric.locale ?? 'en',
      context?.source ?? 'direct',
      context?.medium ?? 'none',
      context?.campaign ?? 'none',
      meta.device,
      meta.browser,
      meta.os,
      meta.country,
      channel,
      metric.tool,
      metric.mode ?? 'none',
      request.headers.get('X-Wenbu-Action') === 'example' ? 'example' : 'none',
      metric.status,
      0,
      Math.min(3600000, Math.max(0, Math.round(metric.duration))),
      metric.modelCalls ?? 0,
      metric.toolCalls ?? 0,
      metric.artifacts ?? 0,
      Number(context?.test ?? request.headers.get('X-Wenbu-Test') === 'true'),
    )
    .run();
}

export async function authorizedAnalytics(request: Request, env: Env) {
  if (!env.ANALYTICS_ADMIN_TOKEN) return false;
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
  if (!token || token.length > 256) return false;
  const digest = async (value: string) =>
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  const a = await digest(token),
    b = await digest(env.ANALYTICS_ADMIN_TOKEN);
  return a.reduce((difference, byte, i) => difference | (byte ^ b[i]), 0) === 0;
}
export async function analyticsReport(url: URL, env: Env) {
  if (!env.ANALYTICS) throw new Error('Analytics unavailable');
  const days = Math.max(1, Math.min(90, Number(url.searchParams.get('days')) || 7));
  const since = Date.now() - days * 86400000;
  const includeTest = url.searchParams.get('test') === 'true';
  const filters: Record<string, readonly string[]> = {
    source: sources,
    campaign: campaigns,
    locale: ['zh', 'en'],
    device: ['mobile', 'desktop', 'tablet', 'bot', 'unknown'],
    channel: ['web', 'api', 'cli', 'mcp'],
  };
  let where = 'occurred_at >= ? AND (? = 1 OR is_test = 0)';
  const values: (string | number)[] = [since, Number(includeTest)];
  for (const [key, allowed] of Object.entries(filters)) {
    const value = url.searchParams.get(key);
    if (value && allowed.includes(value)) {
      where += ` AND ${key} = ?`;
      values.push(value);
    }
  }
  const query = (sql: string) => env.ANALYTICS!.prepare(sql.replaceAll('$WHERE', where)).bind(...values);
  const queries: [string, string][] = [
    [
      'summary',
      `SELECT COUNT(*) events, SUM(event='page_view') pageviews, COUNT(DISTINCT CASE WHEN event='page_view' THEN session_id END) sessions, COUNT(DISTINCT CASE WHEN event='page_view' THEN visitor_id END) visitors, COUNT(DISTINCT CASE WHEN event='engaged' THEN session_id END) engaged_sessions, SUM(event='calculation_succeeded' AND action!='example') calculations, SUM(event='calculation_succeeded' AND action='example') examples, SUM(event='interpret_succeeded') interpretations, SUM(event='agent_finished' AND status='complete') agent_complete, SUM(event='agent_finished' AND status='waiting') agent_waiting, SUM(event='agent_finished' AND status='limited') agent_limited, SUM((event='api_failed' AND status IN ('error','unavailable')) OR (event='agent_finished' AND status IN ('error','timeout'))) failures, SUM(origin='server' AND status='invalid_input') invalid_inputs, SUM(origin='server' AND status='rate_limited') throttled, SUM(event='agent_finished' AND status='cancelled') cancellations, SUM(model_calls) model_calls, SUM(tool_calls) tool_calls, MAX(occurred_at) last_event FROM events WHERE $WHERE`,
    ],
    [
      'daily',
      `SELECT strftime('%Y-%m-%d', occurred_at/1000, 'unixepoch') label, SUM(event='page_view') views, COUNT(DISTINCT CASE WHEN event='page_view' THEN session_id END) sessions, SUM(event='calculation_succeeded' AND action!='example') calculations, SUM(event='calculation_succeeded' AND action='example') examples, SUM(event='agent_finished' AND status='complete') agent FROM events WHERE $WHERE GROUP BY label ORDER BY label`,
    ],
    [
      'events',
      `SELECT event label, origin, status, COUNT(*) count, COUNT(DISTINCT session_id) sessions FROM events WHERE $WHERE GROUP BY event,origin,status ORDER BY count DESC`,
    ],
    [
      'performance',
      `SELECT tool label, status, COUNT(*) count, ROUND(AVG(duration_ms)) average_ms, MAX(duration_ms) max_ms FROM events WHERE $WHERE AND origin='server' GROUP BY tool,status ORDER BY count DESC`,
    ],
    [
      'funnel',
      `WITH steps AS (SELECT session_id, MIN(CASE WHEN event='page_view' THEN occurred_at END) visit, MIN(CASE WHEN event IN ('tool_started','agent_started') AND action!='example' THEN occurred_at END) start, MIN(CASE WHEN (event IN ('calculation_succeeded','interpret_succeeded') AND action!='example') OR (event='agent_finished' AND status='complete') THEN occurred_at END) success, MAX(CASE WHEN event='journal_saved' THEN occurred_at END) saved FROM events WHERE $WHERE AND session_id IS NOT NULL GROUP BY session_id) SELECT COUNT(visit) visited, SUM(visit IS NOT NULL AND start IS NOT NULL) started, SUM(visit IS NOT NULL AND start IS NOT NULL AND success IS NOT NULL) succeeded, SUM(visit IS NOT NULL AND start IS NOT NULL AND success IS NOT NULL AND saved IS NOT NULL) saved FROM steps`,
    ],
  ];
  for (const key of [
    'source',
    'medium',
    'campaign',
    'page',
    'entry_page',
    'locale',
    'device',
    'browser',
    'os',
    'country',
    'channel',
    'tool',
    'mode',
    'action',
  ]) {
    queries.push([
      key,
      `SELECT ${key} label, COUNT(*) events, SUM(event='page_view') views, COUNT(DISTINCT session_id) sessions, SUM((event='calculation_succeeded' AND action!='example') OR event='interpret_succeeded' OR (event='agent_finished' AND status='complete')) successes FROM events WHERE $WHERE GROUP BY ${key} ORDER BY events DESC LIMIT 30`,
    ]);
  }
  const results = await env.ANALYTICS.batch(queries.map(([, sql]) => query(sql)));
  return {
    generatedAt: new Date().toISOString(),
    days,
    includeTest,
    retentionDays: 90,
    timezone: 'UTC',
    data: Object.fromEntries(queries.map(([key], i) => [key, results[i].results])),
  };
}
export async function pruneAnalytics(env: Env) {
  if (env.ANALYTICS)
    await env.ANALYTICS.prepare('DELETE FROM events WHERE occurred_at < ?')
      .bind(Date.now() - 90 * 86400000)
      .run();
}
