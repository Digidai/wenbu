import {
  actions,
  campaigns,
  mediums,
  referrerSource,
  safePage,
  sources,
  type ClientEvent,
  type tools,
  type statuses,
} from './analytics-contract';

type Dimensions = {
  tool?: (typeof tools)[number];
  mode?: 'none' | 'explore' | 'research';
  action?: (typeof actions)[number];
  status?: (typeof statuses)[number];
  value?: number;
  duration?: number;
};
type Session = { id: string; last: number; source: string; medium: string; campaign: string; entry: string };
const preferenceKey = 'wenbu.analytics.disabled';
let session: Session | undefined;
let visitor = '';
let initialized = false;
let queue: Record<string, unknown>[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let memoryDisabled = false;
const retried = new Set<string>();

export function analyticsEnabled() {
  if (
    typeof window === 'undefined' ||
    memoryDisabled ||
    navigator.doNotTrack === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
  )
    return false;
  try {
    return localStorage.getItem(preferenceKey) !== 'true';
  } catch {
    return false;
  }
}
export function setAnalyticsEnabled(enabled: boolean) {
  memoryDisabled = !enabled;
  try {
    localStorage.setItem(preferenceKey, String(!enabled));
    if (!enabled) {
      localStorage.removeItem('wenbu.analytics.visitor');
      sessionStorage.removeItem('wenbu.analytics.session');
    }
  } catch {
    /* Preference applies to this page even when storage is unavailable. */
  }
  if (!enabled) {
    queue = [];
    session = undefined;
    visitor = '';
    clearTimeout(timer);
  }
  window.dispatchEvent(new Event('wenbu:analytics-preference'));
  if (enabled) track('page_view');
  else retried.clear();
}
function identity() {
  if (!analyticsEnabled()) return;
  try {
    const now = Date.now();
    if (!visitor) {
      const stored = JSON.parse(localStorage.getItem('wenbu.analytics.visitor') || 'null');
      const v =
        stored && typeof stored.id === 'string' && stored.expires > now
          ? stored
          : { id: crypto.randomUUID(), expires: now + 30 * 86400000 };
      visitor = v.id;
      localStorage.setItem('wenbu.analytics.visitor', JSON.stringify(v));
    }
    if (!session)
      session = JSON.parse(sessionStorage.getItem('wenbu.analytics.session') || 'null') ?? undefined;
    if (!session || now - session.last > 30 * 60000) {
      const params = new URLSearchParams(location.search);
      const ref = referrerSource(document.referrer, location.origin);
      const source =
        sources.find((s) => s === params.get('utm_source')) ?? (ref === 'internal' ? 'direct' : ref);
      const medium =
        mediums.find((m) => m === params.get('utm_medium')) ??
        (['google', 'bing', 'baidu', 'duckduckgo'].includes(source)
          ? 'organic'
          : ['chatgpt', 'perplexity', 'claude', 'deepseek'].includes(source)
            ? 'ai'
            : source === 'direct'
              ? 'none'
              : 'referral');
      session = {
        id: crypto.randomUUID(),
        last: now,
        source,
        medium,
        campaign: campaigns.find((c) => c === params.get('utm_campaign')) ?? 'none',
        entry: safePage(location.pathname),
      };
    }
    session.last = now;
    sessionStorage.setItem('wenbu.analytics.session', JSON.stringify(session));
    return session;
  } catch {
    return;
  }
}
export function analyticsContext() {
  const s = identity();
  return s
    ? {
        session: s.id,
        visitor,
        source: s.source,
        medium: s.medium,
        campaign: s.campaign,
        entry: s.entry,
        page: safePage(location.pathname),
        locale: document.documentElement.lang.startsWith('zh') ? 'zh' : 'en',
        test: sessionStorage.getItem('wenbu.analytics.test') === 'true',
      }
    : undefined;
}
export function analyticsHeaders(): Record<string, string> {
  const context = analyticsContext();
  return { 'X-Wenbu-Client': 'web', 'X-Wenbu-Analytics': context ? JSON.stringify(context) : 'off' };
}
export function track(event: ClientEvent, dimensions: Dimensions = {}) {
  const context = analyticsContext();
  if (!context) return;
  queue.push({ id: crypto.randomUUID(), event, ...context, ...dimensions });
  if (queue.length >= 10) void flush();
  else if (!timer) timer = setTimeout(() => void flush(), 1500);
}
async function flush() {
  clearTimeout(timer);
  timer = undefined;
  if (!analyticsEnabled() || !queue.length) return;
  const events = queue.splice(0, 10);
  try {
    // No retry storm or duplicate conversion. Event IDs are also deduplicated on the server.
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
      credentials: 'omit',
    });
    if (response.status === 429 || response.status >= 500) throw new Error('Retryable analytics response');
    retried.delete(String(events[0].id));
  } catch {
    const id = String(events[0].id);
    if (analyticsEnabled() && !retried.has(id) && queue.length < 40) {
      retried.add(id);
      queue.unshift(...events);
      timer = setTimeout(() => void flush(), 5000);
      return;
    }
    retried.delete(id);
  }
  if (queue.length) timer = setTimeout(() => void flush(), 100);
}
export function initializeAnalytics() {
  if (initialized || location.pathname.includes('/insights')) return;
  initialized = true;
  track('page_view');
  const depth = new Set<number>();
  let engaged = false;
  let visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
  let visibleMs = 0;
  const updateVisible = () => {
    if (visibleSince) visibleMs += Date.now() - visibleSince;
    visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
    if (!engaged && visibleMs >= 30000) {
      engaged = true;
      track('engaged', { duration: 30000 });
    }
  };
  setInterval(updateVisible, 15000);
  document.addEventListener('visibilitychange', () => {
    updateVisible();
    if (document.visibilityState === 'hidden') void flush();
  });
  window.addEventListener('pagehide', () => void flush());
  window.addEventListener(
    'scroll',
    () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      if (height <= 0) return;
      const percent = (scrollY / height) * 100;
      for (const value of [50, 90])
        if (percent >= value && !depth.has(value)) {
          depth.add(value);
          track('scroll_depth', { value });
        }
    },
    { passive: true },
  );
  document.addEventListener('click', (e) => {
    const el = (e.target as Element)?.closest<HTMLElement>('[data-track]');
    const action = actions.find((a) => a === el?.dataset.track);
    if (action && action !== 'none') track(action === 'source' ? 'source_opened' : 'cta_click', { action });
  });
  const forms = new WeakSet<Element>();
  document.addEventListener('focusin', (e) => {
    const form = (e.target as Element)?.closest('form');
    if (form && !forms.has(form)) {
      forms.add(form);
      track('form_started');
    }
  });
}
