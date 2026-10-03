import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const enabled = vi.hoisted(() => vi.fn(() => true));
vi.mock('../src/lib/analytics', () => ({ analyticsEnabled: enabled }));

describe('Clarity privacy boundaries', () => {
  let host: EventTarget & { clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] } };
  let script: EventTarget & { async?: boolean; src?: string; dataset: Record<string, string> };
  let append: ReturnType<typeof vi.fn>;
  let storage: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.resetModules();
    enabled.mockReturnValue(true);
    host = new EventTarget();
    script = Object.assign(new EventTarget(), { dataset: {} });
    append = vi.fn();
    storage = vi.fn(() => null);
    vi.stubGlobal('window', host);
    vi.stubGlobal('location', { hostname: 'wenbu.app', pathname: '/agent/' });
    vi.stubGlobal('sessionStorage', { getItem: storage });
    vi.stubGlobal('document', {
      documentElement: { lang: 'zh-Hans' },
      createElement: vi.fn(() => script),
      head: { appendChild: append },
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  const start = async () => (await import('../src/lib/clarity')).initializeClarity();

  it('loads once with denied cookie storage and no custom visitor identity', async () => {
    await start();
    await start();
    expect(append).toHaveBeenCalledTimes(1);
    expect(script.src).toBe('https://www.clarity.ms/tag/yqzdf8z0sr');
    expect(script.async).toBe(true);
    expect(host.clarity?.q).toEqual([
      ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }],
      ['set', 'locale', 'zh'],
    ]);
  });
  it.each(['/insights/', '/en/insights/', '/move/', '/en/move/'])('excludes %s', async (pathname) => {
    vi.stubGlobal('location', { hostname: 'wenbu.app', pathname });
    await start();
    expect(append).not.toHaveBeenCalled();
  });
  it('does not record previews or marked test sessions', async () => {
    vi.stubGlobal('location', { hostname: 'localhost', pathname: '/' });
    await start();
    expect(append).not.toHaveBeenCalled();
    vi.resetModules();
    vi.stubGlobal('location', { hostname: 'wenbu.app', pathname: '/' });
    storage.mockReturnValue('true');
    await start();
    expect(append).not.toHaveBeenCalled();
  });
  it('excludes a marked QA cookie before the session flag exists', async () => {
    Object.assign(document, { cookie: 'wenbu_analytics_test=1' });
    await start();
    expect(append).not.toHaveBeenCalled();
  });
  it('honors initial opt-out and can start when measurement is enabled', async () => {
    enabled.mockReturnValue(false);
    await start();
    expect(append).not.toHaveBeenCalled();
    enabled.mockReturnValue(true);
    host.dispatchEvent(new Event('wenbu:analytics-preference'));
    expect(append).toHaveBeenCalledTimes(1);
  });
  it('queues stop even when the SDK is still downloading', async () => {
    await start();
    enabled.mockReturnValue(false);
    host.dispatchEvent(new Event('wenbu:analytics-preference'));
    script.dispatchEvent(new Event('load'));
    expect(host.clarity?.q?.at(-1)).toEqual(['stop']);
    enabled.mockReturnValue(true);
    host.dispatchEvent(new Event('wenbu:analytics-preference'));
    expect(host.clarity?.q?.slice(-2)).toEqual([
      ['start'],
      ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }],
    ]);
    expect(append).toHaveBeenCalledTimes(1);
  });
  it('stops an active SDK after an opt-out in another tab', async () => {
    await start();
    const call = vi.fn();
    host.clarity = call;
    enabled.mockReturnValue(false);
    host.dispatchEvent(Object.assign(new Event('storage'), { key: 'wenbu.analytics.disabled' }));
    expect(call).toHaveBeenLastCalledWith('stop');
  });
  it('does not load when browser storage is unavailable', async () => {
    storage.mockImplementation(() => {
      throw new Error('blocked');
    });
    await start();
    expect(append).not.toHaveBeenCalled();
  });
});
