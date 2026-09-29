import { z } from 'zod';
import { sources, campaigns, tools, statuses, clientEvents } from '../src/lib/analytics-contract';
import { feedbackCategories, feedbackRatings, feedbackStates } from '../src/lib/feedback-contract';
import { ApiError } from './ai';
import { sha256 } from './feedback';
import { pruneAnalytics } from './analytics';
import type { Env } from './types';

type Row = Record<string, string | number | null>;
const serverEvents = [
  'calculation_succeeded',
  'interpret_succeeded',
  'agent_finished',
  'agent_tool_finished',
  'api_failed',
  'mcp_finished',
];
const DAY = 86400000;
function pageCursor(value: string | null): [number, string, number] | undefined {
  if (!value) return;
  try {
    return z
      .tuple([
        z.number().int().nonnegative(),
        z.string().min(1).max(250),
        z
          .number()
          .int()
          .nonnegative()
          .max(Date.now() + 300000),
      ])
      .parse(JSON.parse(atob(value)));
  } catch {
    throw new ApiError(400, 'invalid_cursor', 'Invalid page cursor.');
  }
}
export async function historyReport(url: URL, env: Env, kind: 'events' | 'feedback' | 'archives') {
  if (!env.ANALYTICS) throw new ApiError(503, 'analytics_unavailable', 'Storage is unavailable.');
  const p = url.searchParams;
  const table = kind === 'archives' ? 'analytics_archives' : kind;
  const time = kind === 'events' ? 'occurred_at' : 'created_at';
  const key = kind === 'archives' ? 'key' : 'id';
  const cursor = pageCursor(p.get('cursor'));
  const asOf = cursor?.[2] ?? Date.now();
  const conditions: string[] = [`${kind === 'events' ? 'received_at' : time} <= ?`];
  const values: (string | number)[] = [asOf];
  if (kind !== 'archives') {
    conditions.push('(? = 1 OR is_test=0)');
    values.push(Number(p.get('test') === 'true'));
    const days = z.coerce
      .number()
      .int()
      .min(1)
      .max(kind === 'events' ? 90 : 3650)
      .parse(p.get('days') || (kind === 'events' ? 7 : 3650));
    conditions.push(`${time} >= ?`);
    values.push(asOf - days * DAY);
    const filters: Record<string, readonly string[]> =
      kind === 'events'
        ? {
            source: sources,
            campaign: campaigns,
            locale: ['zh', 'en'],
            device: ['mobile', 'desktop', 'tablet', 'bot', 'unknown'],
            channel: ['web', 'api', 'cli', 'mcp'],
            tool: tools,
            status: statuses,
            origin: ['client', 'server'],
            event: [...clientEvents, ...serverEvents],
          }
        : {
            state: feedbackStates,
            category: feedbackCategories,
            rating: feedbackRatings,
            locale: ['zh', 'en'],
            tool: tools,
          };
    for (const [name, allowed] of Object.entries(filters)) {
      const value = p.get(name);
      if (!value) continue;
      if (!allowed.includes(value)) throw new ApiError(400, 'invalid_filter', `Invalid ${name} filter.`);
      conditions.push(`${name}=?`);
      values.push(value);
    }
    for (const name of ['session', 'visitor', 'operation', 'conversation']) {
      const value = p.get(name);
      if (!value) continue;
      conditions.push(`${name}_id=?`);
      values.push(z.uuid().parse(value));
    }
  }
  if (cursor) {
    conditions.push(`(${time} < ? OR (${time} = ? AND ${key} < ?))`);
    values.push(cursor[0], cursor[0], cursor[1]);
  }
  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .parse(p.get('limit') || 50);
  // Contact and shared text are read only when an administrator opens one feedback item.
  const fields =
    kind === 'feedback'
      ? 'id,created_at,updated_at,revision,state,category,rating,message,page,locale,tool,session_id,operation_id,conversation_id,is_test,share_context'
      : '*';
  const result = await env.ANALYTICS.prepare(
    `SELECT ${fields} FROM ${table} ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY ${time} DESC,${key} DESC LIMIT ?`,
  )
    .bind(...values, limit + 1)
    .all<Row>();
  const rows = result.results.slice(0, limit);
  const last = rows.at(-1);
  return {
    rows,
    asOf,
    next: result.results.length > limit && last ? btoa(JSON.stringify([last[time], last[key], asOf])) : null,
  };
}
export async function feedbackDetail(id: string, env: Env) {
  const data = await env
    .ANALYTICS!.prepare('SELECT * FROM feedback WHERE id=?')
    .bind(z.uuid().parse(id))
    .all<Row>();
  const row = data.results[0];
  if (!row) throw new ApiError(404, 'not_found', 'Feedback not found.');
  const { payload_hash: _hash, ...publicRow } = row;
  return publicRow;
}
export async function storageStatus(env: Env) {
  if (!env.ANALYTICS) throw new ApiError(503, 'analytics_unavailable', 'Storage is unavailable.');
  const results = await env.ANALYTICS.batch([
    env.ANALYTICS.prepare(
      'SELECT COUNT(*) events, SUM(archive_key IS NULL) unarchived, MIN(received_at) oldest_received FROM events',
    ),
    env.ANALYTICS.prepare(
      'SELECT COUNT(*) files, COALESCE(SUM(event_count),0) archived_events, COALESCE(SUM(byte_count),0) bytes FROM analytics_archives',
    ),
    env.ANALYTICS.prepare('SELECT * FROM analytics_maintenance WHERE id=1'),
    env.ANALYTICS.prepare("SELECT COUNT(*) total, SUM(state='new') unread FROM feedback WHERE is_test=0"),
  ]);
  return {
    archiveConfigured: Boolean(env.ANALYTICS_ARCHIVE),
    hotDays: 90,
    events: results[0].results[0],
    archives: results[1].results[0],
    maintenance: results[2].results[0] ?? null,
    feedback: results[3].results[0],
  };
}
export async function archiveAnalytics(env: Env) {
  if (!env.ANALYTICS) throw new Error('Analytics unavailable');
  const db = env.ANALYTICS;
  const started = Date.now(),
    owner = crypto.randomUUID();
  const lock = await db
    .prepare(
      "INSERT INTO analytics_maintenance(id,last_attempt,status,archived_events,lease_owner,lease_until) VALUES(1,?,'running',0,?,?) ON CONFLICT(id) DO UPDATE SET last_attempt=excluded.last_attempt,status='running',archived_events=0,lease_owner=excluded.lease_owner,lease_until=excluded.lease_until WHERE analytics_maintenance.lease_until < ?",
    )
    .bind(started, owner, started + 300000, started)
    .run();
  if (!lock.meta.changes) return { archived: 0, busy: true };
  let count = 0;
  try {
    if (!env.ANALYTICS_ARCHIVE) throw new Error('Archive binding unavailable');
    // Immutable, deterministic batches. Failed uploads never authorize pruning.
    // Duplicate concurrent uploads use the same key; readers deduplicate by event ID.
    for (let batch = 0; batch < 5; batch++) {
      const result = await db
        .prepare(
          'SELECT * FROM events WHERE archive_key IS NULL AND received_at < ? ORDER BY received_at,id LIMIT 500',
        )
        .bind(started - DAY)
        .all<Row>();
      if (!result.results.length) break;
      const rows = result.results;
      const body = rows.map(({ archive_key: _key, ...row }) => JSON.stringify(row)).join('\n') + '\n';
      const hash = await sha256(body);
      const key = `events/v2/${new Date(Number(rows[0].received_at)).toISOString().slice(0, 10)}/${hash}.ndjson`;
      const bytes = new TextEncoder().encode(body).byteLength;
      await env.ANALYTICS_ARCHIVE.put(key, body, {
        httpMetadata: { contentType: 'application/x-ndjson' },
        customMetadata: { sha256: hash, count: String(rows.length), schema: '2' },
      });
      const lease = await db
        .prepare('UPDATE analytics_maintenance SET lease_until=? WHERE id=1 AND lease_owner=?')
        .bind(Date.now() + 300000, owner)
        .run();
      if (!lease.meta.changes) throw new Error('Archive lease lost');
      // D1 batch is transactional. json_each keeps this under D1's bind-parameter limit.
      await db.batch([
        db
          .prepare(
            'INSERT OR IGNORE INTO analytics_archives(key,created_at,first_received_at,last_received_at,event_count,byte_count,sha256) VALUES(?,?,?,?,?,?,?)',
          )
          .bind(key, Date.now(), rows[0].received_at, rows.at(-1)!.received_at, rows.length, bytes, hash),
        db
          .prepare(
            'UPDATE events SET archive_key=? WHERE archive_key IS NULL AND id IN (SELECT value FROM json_each(?))',
          )
          .bind(key, JSON.stringify(rows.map((r) => r.id))),
      ]);
      count += rows.length;
    }
    await pruneAnalytics(env);
    await db
      .prepare(
        "UPDATE analytics_maintenance SET last_success=?,status='complete',archived_events=? WHERE id=1 AND lease_owner=?",
      )
      .bind(Date.now(), count, owner)
      .run();
    return { archived: count };
  } catch (e) {
    await db
      .prepare(
        "UPDATE analytics_maintenance SET status='error',archived_events=? WHERE id=1 AND lease_owner=?",
      )
      .bind(count, owner)
      .run();
    throw e;
  } finally {
    await db
      .prepare('UPDATE analytics_maintenance SET lease_until=0,lease_owner=NULL WHERE id=1 AND lease_owner=?')
      .bind(owner)
      .run();
  }
}
export async function archiveDownload(key: string, env: Env) {
  if (!env.ANALYTICS || !env.ANALYTICS_ARCHIVE)
    throw new ApiError(503, 'archive_unavailable', 'Archive unavailable.');
  const manifest = await env.ANALYTICS.prepare('SELECT key FROM analytics_archives WHERE key=?')
    .bind(key)
    .all();
  if (!manifest.results.length) throw new ApiError(404, 'not_found', 'Archive not found.');
  const object = await env.ANALYTICS_ARCHIVE.get(key);
  if (!object) throw new ApiError(503, 'archive_missing', 'Archive object missing.');
  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Content-Disposition': 'attachment; filename="wenbu-events.ndjson"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    },
  });
}
