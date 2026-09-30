const primary = 'https://wenbu.app';
const legacyHost = 'wenbu.genedai.me';

/** Keep native API clients and the local-history recovery page working on the old host. */
export function domainRedirect(request: Request, site: string): Response | null {
  if (site !== primary) return null;
  const url = new URL(request.url);
  if (url.hostname === legacyHost) {
    if (
      url.pathname.startsWith('/api/') ||
      ['/mcp', '/mcp/', '/move/', '/en/move/'].includes(url.pathname) ||
      url.pathname.startsWith('/_astro/')
    )
      return null;
  } else if (url.hostname !== 'www.wenbu.app') return null;
  const destination = new URL(primary);
  destination.pathname = url.pathname;
  destination.search = url.search;
  return new Response(null, {
    status: request.method === 'GET' || request.method === 'HEAD' ? 301 : 308,
    headers: {
      Location: destination.href,
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
