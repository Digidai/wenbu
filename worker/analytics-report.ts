import {
  browserAudienceSQL,
  browserViewSQL,
  contentRequestSQL,
  serviceRequestSQL,
} from '../src/lib/traffic-contract';
import type { Env } from './types';
import { ApiError } from './ai';
import {
  defaultReportFilters,
  reportDimensions,
  reportMetrics,
  reportTimezones,
  dateInTimezone,
  type AnalyticsReport,
  type ReportFilters,
  type ReportRow,
  type TrendPoint,
} from '../src/lib/analytics-report';

const DAY = 86400000;
function invalid(message: string): never {
  throw new ApiError(400, 'invalid_filter', message);
}
function calendarDate(value: string, offset: number): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return invalid('Use dates in YYYY-MM-DD format.');
  const time = Date.parse(value + 'T00:00:00Z');
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value)
    return invalid('Invalid calendar date.');
  return time - offset;
}
export async function analyticsReport(url: URL, env: Env): Promise<AnalyticsReport> {
  if (!env.ANALYTICS) throw new ApiError(503, 'analytics_unavailable', 'Storage is unavailable.');
  const params = url.searchParams;
  const asOf = Date.now();
  const timezone = params.get('timezone') || 'Asia/Shanghai';
  if (!(reportTimezones as readonly string[]).includes(timezone)) invalid('Unsupported timezone.');
  const offset = timezone === 'Asia/Shanghai' ? 8 * 3600000 : 0;
  const today = Math.floor((asOf + offset) / DAY) * DAY - offset;
  let days = Number(params.get('days') || 7);
  if (!Number.isInteger(days) || days < 1 || days > 90) invalid('Choose between 1 and 90 days.');
  const custom = (params.has('start') && Boolean(params.get('start'))) || Boolean(params.get('end'));
  let end = today + DAY,
    since = end - days * DAY;
  if (custom) {
    since = calendarDate(params.get('start') || '', offset);
    end = calendarDate(params.get('end') || '', offset) + DAY;
    days = (end - since) / DAY;
    if (days < 1 || days > 90 || since < today - 89 * DAY || end > today + DAY)
      invalid('Choose an ordered date range within the last 90 calendar days.');
  }
  const grain = params.get('granularity') || 'auto';
  if (!['auto', 'hour', 'day'].includes(grain)) invalid('Unsupported time granularity.');
  const granularity = grain === 'auto' ? (days <= 3 ? 'hour' : 'day') : (grain as 'hour' | 'day');
  if (granularity === 'hour' && days > 7) invalid('Hourly detail supports up to 7 days.');
  const step = granularity === 'hour' ? 3600000 : DAY;
  if (params.get('test') && !['true', 'false'].includes(params.get('test')!)) invalid('Invalid test filter.');
  const includeTest = params.get('test') === 'true';
  const applied: ReportFilters = {
    ...defaultReportFilters,
    days: String(days),
    timezone,
    granularity: grain,
    test: String(includeTest),
  };
  if (custom) {
    applied.start = params.get('start')!;
    applied.end = params.get('end')!;
  }
  let where = 'occurred_at >= ? AND occurred_at < ? AND received_at <= ? AND (? = 1 OR is_test = 0)';
  const values: (string | number)[] = [since, Math.min(end, asOf + 1), asOf, Number(includeTest)];
  for (const [key, allowed] of Object.entries(reportDimensions)) {
    const value = params.get(key);
    if (!value) continue;
    if (!allowed.includes(value)) invalid('Invalid ' + key + ' filter.');
    where += ` AND ${key} = ?`;
    values.push(value);
    applied[key as keyof ReportFilters] = value;
  }
  const country = params.get('country') || '';
  if (country) {
    if (!/^[A-Z]{2}$/.test(country)) invalid('Country must use a two-letter code.');
    where += ' AND country = ?';
    values.push(country);
    applied.country = country;
  }
  const query = (sql: string) => env.ANALYTICS!.prepare(sql.replaceAll('$WHERE', where)).bind(...values);
  const queries: [string, string][] = [
    [
      'summary',
      `SELECT COUNT(*) events,
      SUM(${contentRequestSQL}) content_requests,
      SUM(${contentRequestSQL} AND actor_type='search_crawler') search_requests,
      SUM(${contentRequestSQL} AND actor_type IN ('ai_crawler','ai_agent')) ai_requests,
      SUM(${serviceRequestSQL}) service_requests,
      SUM(event='page_request' AND http_method='HEAD') head_requests,
      SUM(event='page_request' AND http_status>=400) content_errors,
      SUM(classification_version>0) classified_events, SUM(classification_version=0) legacy_events,
      SUM(event='page_view' AND NOT ${browserAudienceSQL}) excluded_views,
      SUM(${contentRequestSQL} AND actor_type='unknown') unclassified_requests,
      SUM(${contentRequestSQL} AND bot_verified=1) verified_requests,
      SUM(${contentRequestSQL} AND signed_agent=1) signed_requests,
      SUM(${browserViewSQL}) pageviews, COUNT(DISTINCT CASE WHEN ${browserViewSQL} THEN session_id END) sessions, COUNT(DISTINCT CASE WHEN ${browserViewSQL} THEN visitor_id END) visitors, COUNT(DISTINCT CASE WHEN (event='engaged' AND ${browserAudienceSQL}) THEN session_id END) engaged_sessions, SUM(event='calculation_succeeded' AND action!='example') calculations, SUM(event='calculation_succeeded' AND action='example') examples, SUM(event='interpret_succeeded') interpretations, SUM(event='agent_finished' AND status='complete') agent_complete, SUM(event='agent_finished' AND status='waiting') agent_waiting, SUM(event='agent_finished' AND status='limited') agent_limited, SUM((event='api_failed' AND status IN ('error','unavailable')) OR (event='agent_finished' AND status IN ('error','timeout'))) failures, SUM(origin='server' AND status='invalid_input') invalid_inputs, SUM(origin='server' AND status='rate_limited') throttled, SUM(event='agent_finished' AND status='cancelled') cancellations, SUM(model_calls) model_calls, SUM(tool_calls) tool_calls, MAX(occurred_at) last_event FROM events WHERE $WHERE`,
    ],
    [
      'daily',
      `SELECT strftime('%Y-%m-%d', (occurred_at + ${offset})/1000, 'unixepoch') label, SUM(${browserViewSQL}) views, COUNT(DISTINCT CASE WHEN ${browserViewSQL} THEN session_id END) sessions, SUM(event='calculation_succeeded' AND action!='example') calculations, SUM(event='calculation_succeeded' AND action='example') examples, SUM(event='agent_finished' AND status='complete') agent FROM events WHERE $WHERE GROUP BY label ORDER BY label`,
    ],
    [
      'events',
      `SELECT event label, origin, status, COUNT(*) count, COUNT(DISTINCT session_id) sessions FROM events WHERE $WHERE GROUP BY event,origin,status ORDER BY count DESC`,
    ],
    [
      'performance',
      `SELECT tool label, status, COUNT(*) count, ROUND(AVG(duration_ms)) average_ms, MAX(duration_ms) max_ms FROM events WHERE $WHERE AND origin='server' AND ${serviceRequestSQL} GROUP BY tool,status ORDER BY count DESC`,
    ],
    [
      'funnel',
      `WITH steps AS (SELECT session_id, MIN(CASE WHEN ${browserViewSQL} THEN occurred_at END) visit, MIN(CASE WHEN (event='agent_started' OR (event='tool_started' AND action!='example')) THEN occurred_at END) start, MIN(CASE WHEN (event IN ('calculation_succeeded','interpret_succeeded') AND action!='example') OR (event='agent_finished' AND status='complete') THEN occurred_at END) success, MAX(CASE WHEN event='journal_saved' THEN occurred_at END) saved FROM events WHERE $WHERE AND session_id IS NOT NULL AND ${browserAudienceSQL} GROUP BY session_id) SELECT COUNT(visit) visited, SUM(visit IS NOT NULL AND start IS NOT NULL) started, SUM(visit IS NOT NULL AND start IS NOT NULL AND success IS NOT NULL) succeeded, SUM(visit IS NOT NULL AND start IS NOT NULL AND success IS NOT NULL AND saved IS NOT NULL) saved FROM steps`,
    ],
    [
      'guidance',
      `SELECT CASE WHEN event='guide_step' THEN event || '_' || value WHEN event IN ('suggestion_selected','agent_started') THEN event || '_' || action ELSE event END label, COUNT(*) count, COUNT(DISTINCT session_id) sessions FROM events WHERE $WHERE AND (event IN ('guide_opened','guide_step','guide_skipped','guide_draft_created','suggestion_selected') OR (event='agent_started' AND action IN ('guided','clarification','followup','example'))) GROUP BY label ORDER BY label`,
    ],
  ];
  for (const key of [
    'actor_type',
    'actor_name',
    'actor_purpose',
    'classification_evidence',
    'resource_type',
    'http_method',
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
      `SELECT ${key} label, COUNT(*) events, SUM(${contentRequestSQL}) requests, SUM(${serviceRequestSQL}) calls, SUM(${browserViewSQL}) views, COUNT(DISTINCT CASE WHEN ${browserViewSQL} THEN session_id END) sessions, SUM((event='calculation_succeeded' AND action!='example') OR event='interpret_succeeded' OR (event='agent_finished' AND status='complete')) successes FROM events WHERE $WHERE GROUP BY ${key} ORDER BY requests DESC,views DESC,events DESC`,
    ]);
  }
  queries.push(
    [
      'trend',
      `SELECT CAST((occurred_at - ${since}) / ${step} AS INTEGER) bucket,
      SUM(${contentRequestSQL}) content_requests,
      SUM(${contentRequestSQL} AND actor_type='search_crawler') search_requests,
      SUM(${contentRequestSQL} AND actor_type IN ('ai_crawler','ai_agent')) ai_requests,
      SUM(${serviceRequestSQL}) service_requests,
      SUM(${browserViewSQL}) pageviews,
      COUNT(DISTINCT CASE WHEN ${browserViewSQL} THEN visitor_id END) visitors,
      COUNT(DISTINCT CASE WHEN ${browserViewSQL} THEN session_id END) sessions,
      SUM(event='calculation_succeeded' AND action!='example') calculations,
      SUM(event='agent_finished' AND status='complete') agent_complete,
      SUM((event='api_failed' AND status IN ('error','unavailable')) OR (event='agent_finished' AND status IN ('error','timeout'))) failures
      FROM events WHERE $WHERE GROUP BY bucket ORDER BY bucket`,
    ],
    [
      'http_status',
      `SELECT http_status label, http_method method, COUNT(*) requests FROM events WHERE $WHERE AND event='page_request' GROUP BY http_status,http_method ORDER BY requests DESC`,
    ],
    [
      'hours',
      `SELECT CAST(strftime('%H', (occurred_at + ${offset})/1000, 'unixepoch') AS INTEGER) label,
      SUM(${browserViewSQL}) views FROM events WHERE $WHERE GROUP BY label ORDER BY label`,
    ],
  );
  const results = await env.ANALYTICS.batch<ReportRow>(queries.map(([, sql]) => query(sql)));
  const data: Record<string, ReportRow[]> = Object.fromEntries(
    queries.map(([key], i) => [key, results[i].results]),
  );
  const recorded = new Map(data.trend.map((row) => [Number(row.bucket), row]));
  const series = Array.from({ length: (days * DAY) / step }, (_, i) => {
    const bucket = since + i * step,
      finish = bucket + step;
    const state = bucket > asOf ? 'future' : finish > asOf ? 'partial' : 'observed';
    const row = recorded.get(i);
    return {
      bucket,
      end: finish,
      label: new Date(bucket + offset)
        .toISOString()
        .slice(0, granularity === 'hour' ? 16 : 10)
        .replace('T', ' '),
      state,
      ...Object.fromEntries(
        reportMetrics.map(({ key }) => [key, state === 'future' ? null : Number(row?.[key] ?? 0)]),
      ),
    } as TrendPoint;
  });
  const hours = new Map(data.hours.map((row) => [Number(row.label), Number(row.views)]));
  data.hours = Array.from({ length: 24 }, (_, hour) => ({
    label: hour,
    views: days === 1 && since + hour * 3600000 > asOf ? null : (hours.get(hour) ?? 0),
  }));
  delete data.trend;
  return {
    generatedAt: new Date(asOf).toISOString(),
    days,
    includeTest,
    retentionDays: 90,
    timezone,
    filters: applied,
    range: {
      start: since,
      end,
      asOf,
      startDate: dateInTimezone(since, timezone),
      endDate: dateInTimezone(end - 1, timezone),
      granularity,
    },
    series,
    data,
  };
}
