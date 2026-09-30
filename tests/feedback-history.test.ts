import { describe, expect, it, vi } from 'vitest';
import { database } from './helpers/analytics-db';
import { collectEvents, recordService, pruneAnalytics } from '../worker/analytics';
import { submitFeedback, updateFeedback } from '../worker/feedback';
import { archiveAnalytics, archiveDownload, historyReport, feedbackDetail } from '../worker/history';
import worker from '../worker/index';
const origin = 'https://wenbu.app';
const req = (headers: Record<string, string> = {}) => new Request(origin + '/api/feedback', { headers });
const context = () => ({
  session: crypto.randomUUID(),
  visitor: crypto.randomUUID(),
  page: '/tarot/',
  entry: '/',
  locale: 'zh',
  source: 'direct',
  medium: 'none',
  campaign: 'none',
  test: false,
  operation: crypto.randomUUID(),
  conversation: crypto.randomUUID(),
});
const note = () => ({
  id: crypto.randomUUID(),
  page: '/tarot/?secret=private',
  locale: 'zh',
  tool: 'tarot',
  category: 'bug',
  rating: 'mixed',
  message: 'Test-only feedback',
});
const event = (extra = {}) => ({
  ...context(),
  id: crypto.randomUUID(),
  event: 'tool_started',
  occurredAt: Date.now() - 5000,
  version: 2,
  sequence: 3,
  ...extra,
});
function bucket() {
  const files = new Map<string, string>();
  return {
    files,
    binding: {
      put: async (key: string, value: string) => {
        files.set(key, value);
        return {};
      },
      get: async (key: string) => (files.has(key) ? { body: new Blob([files.get(key)!]).stream() } : null),
    } as unknown as R2Bucket,
  };
}
describe('private feedback and linked usage history', () => {
  it('stores a stable receipt once, rejects mutated retries, and requires consent for excerpts', async () => {
    const { sql, env } = database();
    const input = note(),
      ctx = context();
    const request = req({ 'X-Wenbu-Analytics': JSON.stringify(ctx) });
    expect(await submitFeedback(input, request, env)).toEqual({ id: input.id, saved: true });
    await submitFeedback(input, request, env);
    expect(sql.prepare('SELECT COUNT(*) n FROM feedback').get()?.n).toBe(1);
    expect(sql.prepare('SELECT * FROM feedback').get()).toMatchObject({
      page: '/tarot/',
      operation_id: ctx.operation,
      conversation_id: ctx.conversation,
      context_excerpt: '',
      contact: '',
    });
    await expect(submitFeedback({ ...input, message: 'changed' }, request, env)).rejects.toMatchObject({
      status: 409,
    });
    await expect(submitFeedback({ ...note(), excerpt: 'private text' }, request, env)).rejects.toThrow();
    const shared = {
      ...note(),
      shareContext: true,
      excerpt: 'I chose to share this',
      contact: 'test@example.com',
    };
    await submitFeedback(shared, request, env);
    expect(await feedbackDetail(shared.id, env)).toMatchObject({
      context_excerpt: shared.excerpt,
      share_context: 1,
    });
    expect(await feedbackDetail(shared.id, env)).not.toHaveProperty('payload_hash');
    sql.close();
  });
  it('allows explicit feedback when opted out without analytics identity and protects state from lost updates', async () => {
    const { sql, env } = database();
    const input = note();
    await submitFeedback(input, req({ 'X-Wenbu-Analytics': JSON.stringify(context()), DNT: '1' }), env);
    expect(sql.prepare('SELECT session_id,visitor_id,operation_id FROM feedback').get()).toEqual({
      session_id: null,
      visitor_id: null,
      operation_id: null,
    });
    await updateFeedback(input.id, { state: 'reviewing', revision: 1 }, env);
    await expect(updateFeedback(input.id, { state: 'resolved', revision: 1 }, env)).rejects.toMatchObject({
      status: 409,
    });
    expect(await updateFeedback(input.id, { state: 'resolved', revision: 2 }, env)).toEqual({
      saved: true,
      revision: 3,
    });
    sql.close();
  });
  it('keeps chronology and operation links across late delivery, server results and cursor ties', async () => {
    const { sql, env } = database();
    const e = event();
    const ctx = context();
    ctx.operation = e.operation;
    await collectEvents(
      {
        events: [
          e,
          { ...e, id: crypto.randomUUID(), event: 'result_viewed' },
          { ...e, id: crypto.randomUUID(), test: true },
        ],
      },
      req(),
      env,
    );
    await recordService(req({ 'X-Wenbu-Analytics': JSON.stringify(ctx) }), env, {
      event: 'calculation_succeeded',
      tool: 'tarot',
      status: 'complete',
      duration: 20,
    });
    const row = sql.prepare('SELECT * FROM events WHERE id=?').get(e.id)!;
    expect(row.occurred_at).toBe(e.occurredAt);
    expect(row.received_at).toBeGreaterThan(e.occurredAt);
    expect(row.sequence).toBe(3);
    const url = new URL(origin + '/api/admin/events?limit=1&operation=' + e.operation),
      seen: string[] = [];
    let cursor: string | null = null;
    do {
      if (cursor) url.searchParams.set('cursor', cursor);
      const page = await historyReport(url, env, 'events');
      seen.push(...page.rows.map((r) => String(r.id)));
      cursor = page.next;
    } while (cursor);
    expect(seen).toHaveLength(3);
    expect(new Set(seen).size).toBe(3);
    const bad = new URL(origin + '/api/admin/events?operation=DROP%20TABLE');
    await expect(historyReport(bad, env, 'events')).rejects.toThrow();
    await collectEvents({ events: [event({ occurredAt: 1 })] }, req(), env);
    expect(
      sql.prepare('SELECT occurred_at,client_at FROM events WHERE client_at=1').get()?.occurred_at,
    ).toBeGreaterThan(Date.now() - 10000);
    sql.close();
  });
  it('freezes the pagination time window across long exports', async () => {
    const { sql, env } = database();
    const now = Date.now(),
      recent = event({ occurredAt: now - 1000 }),
      edge = event({ occurredAt: now - 86400000 + 5000 });
    await collectEvents({ events: [recent, edge] }, req(), env);
    const url = new URL(origin + '/api/admin/events?days=1&limit=1');
    const first = await historyReport(url, env, 'events');
    expect(first.next).toBeTruthy();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now + 60000);
    try {
      url.searchParams.set('cursor', first.next!);
      const next = await historyReport(url, env, 'events');
      expect(next.asOf).toBe(first.asOf);
      expect(next.rows[0].id).toBe(edge.id);
    } finally {
      clock.mockRestore();
      sql.close();
    }
  });
  it('requires admin credentials on every history route, exact origin for feedback and admin changes', async () => {
    const { sql, env } = database();
    for (const path of [
      'events',
      'feedback',
      'archives',
      'archive?key=private',
      'storage',
      'feedback/' + crypto.randomUUID(),
    ]) {
      const response = await worker.fetch(new Request(origin + '/api/admin/' + path), env);
      expect(response.status).toBe(401);
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    }
    const post = (path: string, headers: Record<string, string>, body: unknown, method = 'POST') =>
      worker.fetch(
        new Request(origin + path, {
          method,
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(body),
        }),
        env,
      );
    expect((await post('/api/feedback', {}, note())).status).toBe(403);
    expect((await post('/api/feedback', { Origin: 'https://evil.example' }, note())).status).toBe(403);
    const response = await post('/api/feedback', { Origin: origin }, note());
    expect(response.status).toBe(200);
    expect(
      (
        await post(
          '/api/admin/feedback/' + crypto.randomUUID(),
          { Authorization: 'Bearer test-only-private-admin' },
          { state: 'resolved', revision: 1 },
          'PATCH',
        )
      ).status,
    ).toBe(403);
    sql.close();
  });
  it('archives exact immutable rows, survives retry, and only prunes verified old receipts', async () => {
    const { sql, env } = database();
    const r2 = bucket();
    env.ANALYTICS_ARCHIVE = r2.binding;
    const old = event();
    await collectEvents({ events: [old, event()] }, req(), env);
    sql.prepare('UPDATE events SET received_at=? WHERE id=?').run(Date.now() - 91 * 86400000, old.id);
    expect(await archiveAnalytics(env)).toEqual({ archived: 1 });
    expect(sql.prepare('SELECT COUNT(*) n FROM events').get()?.n).toBe(1);
    const manifest = sql.prepare('SELECT * FROM analytics_archives').get()!;
    const response = await archiveDownload(String(manifest.key), env);
    const raw = await response.text();
    expect(JSON.parse(raw).id).toBe(old.id);
    expect(JSON.parse(raw)).not.toHaveProperty('archive_key');
    expect(await archiveAnalytics(env)).toEqual({ archived: 0 });
    expect(r2.files.size).toBe(1);
    expect(sql.prepare('SELECT status,lease_until FROM analytics_maintenance').get()).toEqual({
      status: 'complete',
      lease_until: 0,
    });
    sql.close();
  });
  it('preserves old data when storage fails, refuses overlapping jobs, and retries after a failed commit', async () => {
    const { sql, env } = database();
    await collectEvents({ events: [event()] }, req(), env);
    sql.prepare('UPDATE events SET received_at=?').run(Date.now() - 91 * 86400000);
    env.ANALYTICS_ARCHIVE = {
      put: async () => {
        throw new Error('R2 unavailable');
      },
    } as unknown as R2Bucket;
    await expect(archiveAnalytics(env)).rejects.toThrow('R2 unavailable');
    await pruneAnalytics(env);
    expect(sql.prepare('SELECT COUNT(*) n FROM events').get()?.n).toBe(1);
    expect(sql.prepare('SELECT status FROM analytics_maintenance').get()?.status).toBe('error');
    sql.prepare('UPDATE analytics_maintenance SET lease_until=?').run(Date.now() + 100000);
    expect(await archiveAnalytics(env)).toEqual({ archived: 0, busy: true });
    sql.prepare('UPDATE analytics_maintenance SET lease_until=0').run();
    const r2 = bucket();
    env.ANALYTICS_ARCHIVE = r2.binding;
    const original = env.ANALYTICS!.batch.bind(env.ANALYTICS);
    env.ANALYTICS!.batch = async () => {
      throw new Error('D1 failure');
    };
    await expect(archiveAnalytics(env)).rejects.toThrow('D1 failure');
    expect(sql.prepare('SELECT archive_key FROM events').get()?.archive_key).toBeNull();
    expect(r2.files.size).toBe(1);
    env.ANALYTICS!.batch = original;
    expect(await archiveAnalytics(env)).toEqual({ archived: 1 });
    expect(r2.files.size).toBe(1);
    sql.close();
  });
});
