import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  analyticsReport,
  authorizedAnalytics,
  collectEvents,
  eventBatch,
  pruneAnalytics,
  recordService,
} from '../worker/analytics';
import { pagePaths, referrerSource, safePage } from '../src/lib/analytics-contract';
import { articles } from '../src/data/articles';
import { comparisons } from '../src/data/comparisons';
import { pages } from '../src/data/pages';
import type { Env } from '../worker/types';
import worker from '../worker/index';

function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../migrations/0001_analytics.sql', import.meta.url), 'utf8'));
  const prepare = (query: string, args: (string | number | null)[] = []) => ({
    bind: (...values: (string | number | null)[]) => prepare(query, values),
    all: async () => ({ results: sql.prepare(query).all(...args), success: true, meta: { changes: 0 } }),
    run: async () => ({
      results: [],
      success: true,
      meta: { changes: Number(sql.prepare(query).run(...args).changes) },
    }),
    query,
  });
  const binding = {
    prepare,
    batch: async (items: ReturnType<typeof prepare>[]) =>
      Promise.all(items.map((i) => (i.query.startsWith('INSERT') ? i.run() : i.all()))),
  };
  return {
    sql,
    env: { ANALYTICS: binding, ANALYTICS_ADMIN_TOKEN: 'test-only-private-admin' } as unknown as Env,
  };
}
function context() {
  return {
    session: crypto.randomUUID(),
    visitor: crypto.randomUUID(),
    page: '/tarot/',
    entry: '/',
    source: 'google',
    medium: 'organic',
    campaign: 'launch',
    locale: 'zh',
    test: false,
  };
}
const request = (headers: Record<string, string> = {}) =>
  new Request('https://wenbu.genedai.me/api/v1/tarot', { headers });
describe('closed analytics contract', () => {
  it('records malformed, oversized and unsupported requests as input failures, not service errors', async () => {
    const { sql, env } = database();
    for (const [body, contentType, status] of [
      ['{invalid', 'application/json', 400],
      [JSON.stringify({ text: 'x'.repeat(9000) }), 'application/json', 413],
      ['{}', 'text/plain', 415],
    ] as const) {
      const pending: Promise<unknown>[] = [];
      const response = await worker.fetch(
        new Request('https://wenbu.genedai.me/api/v1/tarot', {
          method: 'POST',
          headers: { 'Content-Type': contentType },
          body,
        }),
        env,
        { waitUntil: (promise: Promise<unknown>) => pending.push(promise) } as unknown as ExecutionContext,
      );
      expect(response.status).toBe(status);
      await Promise.all(pending);
    }
    const report = await analyticsReport(new URL('https://wenbu.genedai.me/api/admin/analytics'), env);
    expect(report.data.summary[0]).toMatchObject({ invalid_inputs: 3, failures: 0 });
    expect(sql.prepare('SELECT COUNT(*) n FROM events WHERE status=?').get('invalid_input')?.n).toBe(3);
    sql.close();
  });
  it('rejects free-form text, identifiers in unexpected fields and forged server events', () => {
    const event = { ...context(), id: crypto.randomUUID(), event: 'page_view' };
    expect(() => eventBatch.parse({ events: [{ ...event, question: 'private question' }] })).toThrow();
    expect(() => eventBatch.parse({ events: [{ ...event, event: 'calculation_succeeded' }] })).toThrow();
    expect(() => eventBatch.parse({ events: [{ ...event, campaign: 'someone@example.com' }] })).toThrow();
    expect(() => eventBatch.parse({ events: Array(11).fill(event) })).toThrow();
  });
  it('covers every public content path and discards unknown URLs and search details', () => {
    for (const path of [
      ...Object.keys(pages),
      ...articles.map((a) => `${a.category}/${a.slug}`),
      ...comparisons.map((c) => `compare/${c.slug}`),
    ])
      expect(pagePaths).toContain(path);
    expect(safePage('/en/tarot/?question=private#name')).toBe('/tarot/');
    expect(safePage('/private-person-1988/')).toBe('/other/');
    expect(referrerSource('https://www.google.com/search?q=private', 'https://wenbu.genedai.me')).toBe(
      'google',
    );
    expect(referrerSource('https://someone.example/private', 'https://wenbu.genedai.me')).toBe('other');
  });
  it('deduplicates receipts in actual SQLite and stores no raw request data', async () => {
    const { sql, env } = database();
    const event = { ...context(), id: crypto.randomUUID(), event: 'page_view' };
    expect(
      await collectEvents(
        { events: [event] },
        request({ 'User-Agent': 'Mozilla/5.0 Macintosh Chrome/130', 'CF-Connecting-IP': '198.51.100.1' }),
        env,
      ),
    ).toEqual({ accepted: 1 });
    expect(await collectEvents({ events: [event] }, request(), env)).toEqual({ accepted: 0 });
    const row = sql.prepare('SELECT * FROM events').get();
    expect(row).toMatchObject({ device: 'desktop', browser: 'chrome', os: 'macos', page: '/tarot/' });
    expect(JSON.stringify(row)).not.toContain('198.51.100.1');
    sql.close();
  });
  it.each([{ DNT: '1' }, { 'Sec-GPC': '1' }, { 'X-Wenbu-Analytics': 'off' }])(
    'honors opt-out %j on both ingestion paths',
    async (headers) => {
      const { sql, env } = database();
      await collectEvents(
        { events: [{ ...context(), id: crypto.randomUUID(), event: 'page_view' }] },
        request(headers),
        env,
      );
      await recordService(request(headers), env, {
        event: 'calculation_succeeded',
        tool: 'tarot',
        status: 'complete',
        duration: 10,
      });
      expect(sql.prepare('SELECT COUNT(*) n FROM events').get()?.n).toBe(0);
      sql.close();
    },
  );
  it('counts actual service success separately, excludes test data and tolerates beacon reordering', async () => {
    const { sql, env } = database();
    const ctx = context();
    await recordService(request({ 'X-Wenbu-Analytics': JSON.stringify(ctx) }), env, {
      event: 'calculation_succeeded',
      tool: 'tarot',
      status: 'complete',
      duration: 15,
    });
    await collectEvents(
      {
        events: ['page_view', 'tool_started', 'journal_saved'].map((event) => ({
          ...ctx,
          id: crypto.randomUUID(),
          event,
        })),
      },
      request(),
      env,
    );
    await collectEvents(
      { events: [{ ...context(), id: crypto.randomUUID(), event: 'page_view', test: true }] },
      request(),
      env,
    );
    const report = await analyticsReport(new URL('https://wenbu.genedai.me/api/admin/analytics?days=7'), env);
    expect(report.data.summary[0]).toMatchObject({ pageviews: 1, calculations: 1, sessions: 1 });
    expect(report.data.funnel[0]).toMatchObject({ visited: 1, started: 1, succeeded: 1, saved: 1 });
    const include = await analyticsReport(
      new URL('https://wenbu.genedai.me/api/admin/analytics?test=true'),
      env,
    );
    expect(include.data.summary[0]).toMatchObject({ pageviews: 2 });
    sql.close();
  });
  it('filters without interpolating values and prunes only expired events', async () => {
    const { sql, env } = database();
    const event = { ...context(), id: crypto.randomUUID(), event: 'page_view' };
    await collectEvents({ events: [event] }, request(), env);
    const report = await analyticsReport(
      new URL('https://wenbu.genedai.me/api/admin/analytics?source=github'),
      env,
    );
    expect(report.data.summary[0].events).toBe(0);
    const injection = await analyticsReport(
      new URL("https://wenbu.genedai.me/api/admin/analytics?source=';DROP%20TABLE%20events;--"),
      env,
    );
    expect(injection.data.summary[0].events).toBe(1);
    sql.prepare('UPDATE events SET occurred_at = ?').run(Date.now() - 91 * 86400000);
    await collectEvents({ events: [{ ...event, id: crypto.randomUUID() }] }, request(), env);
    await pruneAnalytics(env);
    expect(sql.prepare('SELECT COUNT(*) n FROM events').get()?.n).toBe(1);
    sql.close();
  });
  it('separates examples, bad input, limits and cancellation from service faults', async () => {
    const { sql, env } = database();
    await recordService(request({ 'X-Wenbu-Action': 'example' }), env, {
      event: 'calculation_succeeded',
      tool: 'bazi',
      status: 'complete',
      duration: 10,
    });
    for (const status of ['invalid_input', 'rate_limited', 'error'] as const)
      await recordService(request(), env, { event: 'api_failed', tool: 'bazi', status, duration: 10 });
    await recordService(request(), env, {
      event: 'agent_finished',
      tool: 'agent',
      status: 'cancelled',
      duration: 10,
    });
    const report = await analyticsReport(new URL('https://wenbu.genedai.me/api/admin/analytics'), env);
    expect(report.data.summary[0]).toMatchObject({
      calculations: 0,
      examples: 1,
      failures: 1,
      invalid_inputs: 1,
      throttled: 1,
      cancellations: 1,
    });
    sql.close();
  });
  it('requires the server secret for reports; URLs never authenticate', async () => {
    const { sql, env } = database();
    expect(await authorizedAnalytics(request(), env)).toBe(false);
    expect(await authorizedAnalytics(request({ Authorization: 'Bearer wrong' }), env)).toBe(false);
    expect(await authorizedAnalytics(request({ Authorization: 'Bearer test-only-private-admin' }), env)).toBe(
      true,
    );
    sql.close();
  });
});
