import { afterEach, describe, expect, it, vi } from 'vitest';
import { classifyTraffic, contentTarget } from '../worker/traffic';
import { collectEvents, recordContent, recordService } from '../worker/analytics';
import { analyticsReport } from '../worker/analytics-report';
import { historyReport, archiveAnalytics } from '../worker/history';
import worker from '../worker/index';
import { database } from './helpers/analytics-db';

const browser = 'Mozilla/5.0 (Macintosh) Chrome/130.0 Safari/537.36';
const request = (ua = browser, path = '/learn/', headers: Record<string, string> = {}) =>
  new Request('https://wenbu.app' + path, { headers: { 'User-Agent': ua, ...headers } });
const context = () => ({
  session: crypto.randomUUID(),
  visitor: crypto.randomUUID(),
  page: '/learn/',
  entry: '/',
  locale: 'zh',
  source: 'chatgpt',
  medium: 'ai',
  campaign: 'none',
  test: false,
});
afterEach(() => vi.restoreAllMocks());
describe('traffic identity and classification evidence', () => {
  it.each([
    ['Googlebot/2.1', 'search_crawler', 'googlebot', 'search'],
    ['bingbot/2.0', 'search_crawler', 'bingbot', 'search'],
    ['Baiduspider/2.0', 'search_crawler', 'baiduspider', 'search'],
    ['OAI-SearchBot/1.0', 'ai_crawler', 'oai_searchbot', 'search'],
    ['GPTBot/1.2', 'ai_crawler', 'gptbot', 'training'],
    ['ChatGPT-User/1.0', 'ai_agent', 'chatgpt_user', 'user_fetch'],
    ['ClaudeBot/1.0', 'ai_crawler', 'claudebot', 'training'],
    ['Claude-SearchBot/1.0', 'ai_crawler', 'claude_searchbot', 'search'],
    ['Claude-User/1.0', 'ai_agent', 'claude_user', 'user_fetch'],
    ['PerplexityBot/1.0', 'ai_crawler', 'perplexitybot', 'search'],
    ['Perplexity-User/1.0', 'ai_agent', 'perplexity_user', 'user_fetch'],
    ['HeadlessChrome/130', 'automation', 'headless', 'other'],
    ['curl/8.1', 'automation', 'script', 'other'],
  ])('matches %s ahead of embedded browser UA and keeps purpose distinct', (ua, type, name, purpose) => {
    expect(classifyTraffic(request(browser + ' ' + ua))).toMatchObject({
      actor_type: type,
      actor_name: name,
      actor_purpose: purpose,
      classification_evidence: 'ua_declared',
      bot_verified: null,
      signed_agent: null,
      classification_version: 1,
    });
  });
  it('keeps attribution and client declarations independent; ignores forged verification headers', () => {
    expect(
      classifyTraffic(
        request(browser, '/?utm_source=chatgpt', { 'CF-Verified-Bot': 'true', 'X-Bot-Score': '99' }),
      ),
    ).toMatchObject({ actor_type: 'browser', classification_evidence: 'browser_hint', bot_verified: null });
    expect(classifyTraffic(request('curl/8', '/mcp'))).toMatchObject({
      actor_type: 'tool_client',
      actor_name: 'mcp_client',
    });
    expect(classifyTraffic(request('curl/8', '/api/v1/tarot', { 'X-Wenbu-Client': 'cli' }))).toMatchObject({
      actor_type: 'tool_client',
      actor_name: 'cli_client',
      classification_evidence: 'tool_declared',
    });
    expect(classifyTraffic(request('', '/api/v1/tarot'))).toMatchObject({ actor_name: 'api_client' });
    expect(classifyTraffic(request('opaque-client'))).toMatchObject({ actor_type: 'unknown' });
    expect(classifyTraffic(request('Google-Extended'))).toMatchObject({ actor_type: 'unknown' });
  });
  it('uses trusted cf hints only when available and never invents a user trigger', () => {
    const hinted = (cf: object, ua = browser) => {
      const r = request(ua);
      Object.defineProperty(r, 'cf', { value: cf });
      return r;
    };
    expect(
      classifyTraffic(
        hinted({ botManagement: { verifiedBot: true }, verifiedBotCategory: 'Search Engine Crawler' }),
      ),
    ).toMatchObject({
      actor_type: 'search_crawler',
      actor_name: 'cf_bot',
      classification_evidence: 'cf_verified',
      bot_verified: 1,
    });
    expect(classifyTraffic(hinted({ botManagement: { signedAgent: true } }))).toMatchObject({
      actor_type: 'ai_agent',
      actor_name: 'cf_agent',
      actor_purpose: 'unknown',
      signed_agent: 1,
    });
    expect(classifyTraffic(hinted({ botManagement: { score: 12, verifiedBot: false } }))).toMatchObject({
      actor_type: 'automation',
      classification_evidence: 'cf_score',
      bot_score: 12,
    });
    expect(classifyTraffic(hinted({ botManagement: { score: 999 } }))).toMatchObject({
      actor_type: 'browser',
      bot_score: null,
    });
    expect(classifyTraffic(hinted({ botManagement: { verifiedBot: true } }, 'GPTBot/1.2'))).toMatchObject({
      actor_type: 'ai_crawler',
      actor_purpose: 'training',
      actor_name: 'gptbot',
      classification_evidence: 'cf_verified',
    });
  });
});
describe('content request collection and consistent analytics populations', () => {
  it('counts HTML, machine-readable guides and discovery, excludes assets, private or arbitrary paths and ignores query contents', () => {
    expect(contentTarget(request(browser, '/en/learn/bazi-basics/?question=private'))).toMatchObject({
      page: '/learn/bazi-basics/',
      resource: 'html',
      locale: 'en',
    });
    expect(contentTarget(request('GPTBot/1', '/knowledge/zh/bazi-basics.md'))).toMatchObject({
      page: '/learn/bazi-basics/',
      resource: 'markdown',
    });
    for (const path of [
      '/insights/',
      '/en/insights/',
      '/_astro/code.js',
      '/images/a.webp',
      '/private-email@example.com/',
      '/knowledge/zh/private.md',
    ])
      expect(contentTarget(request(browser, path))).toBeUndefined();
    expect(contentTarget(request('', '/llms.txt'))?.resource).toBe('discovery');
  });
  it('records edge responses without blocking or changing the body; analytics failure cannot break the page', async () => {
    const db = database(),
      pending: Promise<unknown>[] = [];
    db.env.ASSETS = { fetch: async () => new Response('real page', { status: 200 }) } as Fetcher;
    const ctx = { waitUntil: (p: Promise<unknown>) => pending.push(p) } as unknown as ExecutionContext;
    const response = await worker.fetch(request('Googlebot/2.1', '/en/learn/'), db.env, ctx);
    expect(await response.text()).toBe('real page');
    await Promise.all(pending);
    expect(db.sql.prepare('SELECT * FROM events').get()).toMatchObject({
      origin: 'edge',
      actor_type: 'search_crawler',
      http_status: 200,
      page: '/learn/',
      visitor_id: null,
      session_id: null,
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    db.env.ANALYTICS!.prepare = () => {
      throw new Error('db unavailable');
    };
    expect(await (await worker.fetch(request(), db.env, ctx)).text()).toBe('real page');
    await Promise.all(pending);
    expect(spy).toHaveBeenCalledWith('WENBU_ANALYTICS_WRITE_FAILED');
    db.sql.close();
  });
  it.each([
    { DNT: '1' },
    { 'Sec-GPC': '1' },
    { 'X-Wenbu-Analytics': 'off' },
    { Cookie: 'other=x; wenbu_analytics=off' },
  ])('respects opt-out %j in edge, browser and service collectors', async (headers) => {
    const db = database(),
      r = request(browser, '/', headers);
    await recordContent(r, new Response(''), db.env, 5);
    await collectEvents(
      { events: [{ ...context(), id: crypto.randomUUID(), event: 'page_view' }] },
      r,
      db.env,
    );
    await recordService(r, db.env, {
      event: 'calculation_succeeded',
      tool: 'tarot',
      status: 'complete',
      duration: 5,
    });
    expect(db.sql.prepare('SELECT COUNT(*) n FROM events').get()?.n).toBe(0);
    db.sql.close();
  });
  it('avoids double PV, excludes bot / unknown JS from browser metrics, keeps HEAD separate and aligns all filters with history', async () => {
    const db = database(),
      ctx = context();
    const receipt = { ...ctx, id: crypto.randomUUID(), event: 'page_view' };
    await recordContent(
      request(browser, '/learn/?question=private', { 'CF-Connecting-IP': '198.51.100.24' }),
      new Response(''),
      db.env,
      10,
    );
    await collectEvents({ events: [receipt] }, request(), db.env);
    await collectEvents({ events: [receipt] }, request(), db.env);
    for (const ua of ['GPTBot/1', 'ChatGPT-User/1', 'Googlebot/2', '', 'HeadlessChrome/130']) {
      await recordContent(request(ua), new Response('', { status: 404 }), db.env, 5);
      await collectEvents(
        { events: [{ ...ctx, id: crypto.randomUUID(), event: 'page_view' }] },
        request(ua),
        db.env,
      );
    }
    await recordContent(
      new Request('https://wenbu.app/learn/', { method: 'HEAD', headers: { 'User-Agent': 'GPTBot/1' } }),
      new Response(null, { status: 200 }),
      db.env,
      1,
    );
    await recordContent(
      request('GPTBot/1', '/learn/', { 'X-Wenbu-Test': 'true' }),
      new Response(''),
      db.env,
      1,
    );
    const url = (q = '') => new URL('https://wenbu.app/api/admin/analytics?days=1' + q);
    const report = await analyticsReport(url(), db.env);
    expect(report.data.summary[0]).toMatchObject({
      content_requests: 6,
      pageviews: 1,
      visitors: 1,
      sessions: 1,
      ai_requests: 2,
      search_requests: 1,
      head_requests: 1,
      excluded_views: 5,
      unclassified_requests: 1,
    });
    for (const metric of ['content_requests', 'pageviews', 'ai_requests', 'search_requests'])
      expect(report.series.reduce((n, r) => n + Number(r[metric as keyof typeof r] ?? 0), 0)).toBe(
        report.data.summary[0][metric],
      );
    expect(report.data.actor_type.reduce((n, r) => n + Number(r.requests), 0)).toBe(6);
    const q =
      '&actor_type=ai_crawler&actor_name=gptbot&actor_purpose=training&classification_evidence=ua_declared&resource_type=html&http_method=GET';
    const filtered = await analyticsReport(url(q), db.env);
    expect(filtered.data.summary[0]).toMatchObject({ content_requests: 1, pageviews: 0, ai_requests: 1 });
    expect(filtered.data.actor_name).toEqual([expect.objectContaining({ label: 'gptbot', requests: 1 })]);
    expect((await analyticsReport(url(q + '&test=true'), db.env)).data.summary[0].content_requests).toBe(2);
    const history = await historyReport(
      new URL('https://wenbu.app/api/admin/events?event=page_request' + q),
      db.env,
      'events',
    );
    expect(history.rows).toHaveLength(1);
    expect(history.rows[0]).toMatchObject({
      actor_name: 'gptbot',
      http_status: 404,
      classification_version: 1,
    });
    const rows = JSON.stringify(db.sql.prepare('SELECT * FROM events').all());
    for (const secret of ['private', '198.51.100.24', browser, 'User-Agent'])
      expect(rows).not.toContain(secret);
    for (const bad of [
      'actor_type=human',
      'actor_name=evil',
      'classification_evidence=guaranteed',
      'http_method=DROP',
    ]) {
      await expect(analyticsReport(url('&' + bad), db.env)).rejects.toMatchObject({ status: 400 });
      await expect(historyReport(url('&' + bad), db.env, 'events')).rejects.toMatchObject({ status: 400 });
    }
    db.sql.close();
  });
  it('preserves legacy records and counts MCP request once despite tool phases', async () => {
    const db = database();
    for (const ua of [browser, 'GenericBot/1'])
      await collectEvents(
        { events: [{ ...context(), id: crypto.randomUUID(), event: 'page_view' }] },
        request(ua),
        db.env,
      );
    db.sql.exec(
      "UPDATE events SET actor_type='legacy',actor_name='legacy',actor_purpose='legacy',classification_evidence='legacy',classification_version=0",
    );
    for (const event of ['mcp_finished', 'calculation_succeeded'] as const)
      await recordService(request('curl/8', '/mcp'), db.env, {
        event,
        tool: 'mcp',
        status: 'complete',
        duration: 5,
      });
    const r = await analyticsReport(new URL('https://wenbu.app/api/admin/analytics'), db.env);
    expect(r.data.summary[0]).toMatchObject({
      legacy_events: 2,
      pageviews: 1,
      service_requests: 1,
      calculations: 1,
    });
    expect(r.data.performance).toEqual([expect.objectContaining({ count: 1 })]);
    expect(r.data.actor_type).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'legacy', views: 1 }),
        expect.objectContaining({ label: 'tool_client', calls: 1 }),
      ]),
    );
    db.sql.close();
  });
  it('archives classification and HTTP evidence with the original row, without request payloads', async () => {
    const db = database(),
      files = new Map<string, string>();
    db.env.ANALYTICS_ARCHIVE = {
      put: async (key: string, body: string) => {
        files.set(key, body);
      },
    } as unknown as R2Bucket;
    await recordContent(
      request('Claude-User/1', '/knowledge/en/bazi-basics.md'),
      new Response(''),
      db.env,
      5,
    );
    db.sql.prepare('UPDATE events SET received_at=?').run(Date.now() - 2 * 86400000);
    expect(await archiveAnalytics(db.env)).toEqual({ archived: 1 });
    const body = JSON.parse([...files.values()][0]);
    expect(body).toMatchObject({
      actor_type: 'ai_agent',
      actor_name: 'claude_user',
      classification_version: 1,
      classification_evidence: 'ua_declared',
      resource_type: 'markdown',
      http_status: 200,
      visitor_id: null,
    });
    expect(body).not.toHaveProperty('archive_key');
    expect([...files.keys()][0]).toMatch(/^events\/v3\//);
    db.sql.close();
  });
});
