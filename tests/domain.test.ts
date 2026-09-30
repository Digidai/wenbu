import { describe, expect, it } from 'vitest';
import { domainRedirect } from '../worker/domain';
import worker from '../worker/index';
import type { Env } from '../worker/types';
import { referrerSource } from '../src/lib/analytics-contract';
import { isHistoryMessage, localHistory, mergeHistory, type LocalHistory } from '../src/lib/domain-move';

describe('primary domain migration', () => {
  it('runs the redirect before static assets and keeps old same-origin calculations usable', async () => {
    const env = {
      SITE_URL: 'https://wenbu.app',
      ASSETS: {
        fetch: () => {
          throw new Error('should_not_fetch');
        },
      },
    } as unknown as Env;
    expect((await worker.fetch(new Request('https://wenbu.genedai.me/en/agent/'), env)).status).toBe(301);
    const response = await worker.fetch(
      new Request('https://wenbu.genedai.me/api/v1/iching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://wenbu.genedai.me' },
        body: JSON.stringify({ lines: [7, 7, 7, 7, 7, 7] }),
      }),
      env,
    );
    expect(response.status).toBe(200);
  });
  it('treats old-site links as internal without grouping unrelated or lookalike hosts', () => {
    expect(referrerSource('https://wenbu.genedai.me/agent/', 'https://wenbu.app')).toBe('internal');
    expect(referrerSource('https://www.wenbu.app/', 'https://wenbu.app')).toBe('internal');
    expect(referrerSource('https://wenbu.app.evil.test/', 'https://wenbu.app')).toBe('other');
    expect(referrerSource('https://genedai.me/', 'https://wenbu.app')).toBe('other');
  });
  it('preserves old deep links and query strings without accepting a redirect destination', () => {
    const response = domainRedirect(
      new Request('https://wenbu.genedai.me/en/learn/?utm_source=x&next=https://evil.test'),
      'https://wenbu.app',
    );
    expect(response?.status).toBe(301);
    expect(response?.headers.get('Location')).toBe(
      'https://wenbu.app/en/learn/?utm_source=x&next=https://evil.test',
    );
  });
  it('normalizes www and preserves POST semantics', () => {
    const response = domainRedirect(
      new Request('https://www.wenbu.app/api/v1/tarot', { method: 'POST' }),
      'https://wenbu.app',
    );
    expect(response?.status).toBe(308);
    expect(response?.headers.get('Location')).toBe('https://wenbu.app/api/v1/tarot');
  });
  it('keeps legacy API clients, local recovery and required assets available', () => {
    for (const path of [
      '/api/v1/agent',
      '/api/events',
      '/mcp',
      '/mcp/',
      '/move/',
      '/en/move/',
      '/_astro/app.js',
    ])
      expect(domainRedirect(new Request('https://wenbu.genedai.me' + path), 'https://wenbu.app')).toBeNull();
  });
  it('does not redirect the primary host, local development or a migration that is not enabled', () => {
    for (const url of ['https://wenbu.app/agent/', 'http://localhost:8787/agent/'])
      expect(domainRedirect(new Request(url), 'https://wenbu.app')).toBeNull();
    expect(
      domainRedirect(new Request('https://wenbu.genedai.me/agent/'), 'https://wenbu.genedai.me'),
    ).toBeNull();
  });
});

const empty = (): LocalHistory => ({
  type: 'wenbu-domain-move-v1',
  journal: [],
  sessions: [],
  analyticsDisabled: false,
});
function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    removeItem: (k: string) => {
      data.delete(k);
    },
  };
}
describe('local history transfer', () => {
  it('merges by ID, preserves newer destination records, and retains analytics opt-out', () => {
    const storage = memoryStorage();
    mergeHistory(storage, { ...empty(), journal: [{ id: 'a', note: 'new' }], analyticsDisabled: true });
    mergeHistory(storage, {
      ...empty(),
      journal: [{ id: 'a', note: 'old' }, { id: 'b' }],
      sessions: [{ id: 's' }],
    });
    expect(localHistory(storage)).toEqual({
      ...empty(),
      journal: [{ id: 'a', note: 'new' }, { id: 'b' }],
      sessions: [{ id: 's' }],
      analyticsDisabled: true,
    });
  });
  it('never silently truncates records that exceed existing product limits', () => {
    const storage = memoryStorage();
    expect(() =>
      mergeHistory(storage, {
        ...empty(),
        journal: Array.from({ length: 101 }, (_, i) => ({ id: String(i) })),
      }),
    ).toThrow('storage_full');
    expect(localHistory(storage)).toEqual(empty());
  });
  it('rolls back destination data if a storage write fails', () => {
    const storage = memoryStorage();
    storage.setItem('wenbu.journal.v1', '[{"id":"kept"}]');
    let writes = 0;
    const limited = {
      ...storage,
      setItem: (key: string, value: string) => {
        if (++writes === 2) throw new Error('quota');
        storage.setItem(key, value);
      },
    };
    expect(() => mergeHistory(limited, { ...empty(), journal: [{ id: 'incoming' }] })).toThrow('quota');
    expect(localHistory(storage).journal).toEqual([{ id: 'kept' }]);
  });
  it('rejects a foreign origin, wrong popup, null source, and malformed payloads', () => {
    const popup = {} as Window;
    expect(isHistoryMessage({ origin: 'https://wenbu.genedai.me', source: popup }, popup)).toBe(true);
    expect(isHistoryMessage({ origin: 'https://evil.test', source: popup }, popup)).toBe(false);
    expect(isHistoryMessage({ origin: 'https://wenbu.genedai.me', source: {} as Window }, popup)).toBe(false);
    expect(isHistoryMessage({ origin: 'https://wenbu.genedai.me', source: null }, null)).toBe(false);
    expect(() =>
      mergeHistory(memoryStorage(), { ...empty(), journal: [null] } as unknown as LocalHistory),
    ).toThrow();
  });
});
