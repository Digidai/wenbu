import { z } from 'zod';
import { calculate } from '../src/lib/tools';
import { InputError, type ToolKind } from '../src/lib/schema';
import { ApiError, interpret } from './ai';
import { handleMcp } from './mcp';
import type { Env } from './types';
export { UsageGate } from './quota';

const apiHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};
export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: apiHeaders });
}
export async function boundedBody(request: Request, limit = 8192) {
  if (!request.headers.get('Content-Type')?.toLowerCase().includes('application/json'))
    throw new ApiError(415, 'content_type', 'Use application/json.');
  if (Number(request.headers.get('Content-Length') || 0) > limit)
    throw new ApiError(413, 'body_too_large', 'Request body is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'missing_body', 'JSON body required.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new ApiError(413, 'body_too_large', 'Request body is too large.');
      }
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new ApiError(400, 'invalid_json', 'Invalid JSON.');
  }
}
export function originAllowed(request: Request, env: Env) {
  const origin = request.headers.get('Origin');
  if (!origin) return true; // CLI and server MCP clients have no browser Origin.
  const target = new URL(request.url);
  if (origin === env.SITE_URL || origin === target.origin) return true;
  if (['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)) {
    try {
      return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname);
    } catch {
      return false;
    }
  }
  return false;
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    if (!path.startsWith('/api/') && path !== '/mcp' && path !== '/mcp/') return env.ASSETS.fetch(request);
    if (!originAllowed(request, env))
      return json({ error: { code: 'origin_denied', message: 'Origin not allowed.' } }, 403);
    try {
      if (path === '/api/health' && request.method === 'GET')
        return json({
          status: 'ok',
          version: '1.0.0',
          aiConfigured: Boolean(env.DEEPSEEK_API_KEY && env.QUOTA_SALT),
          requestedModel: env.DEEPSEEK_MODEL,
        });
      if (request.method === 'OPTIONS')
        return new Response(null, {
          status: 204,
          headers: {
            ...apiHeaders,
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept, MCP-Protocol-Version',
            'Access-Control-Allow-Origin': request.headers.get('Origin') || env.SITE_URL,
            Vary: 'Origin',
          },
        });
      if (env.RATE_LIMITER) {
        const result = await env.RATE_LIMITER.limit({
          key: request.headers.get('CF-Connecting-IP') ?? 'local',
        });
        if (!result.success)
          return json({ error: { code: 'rate_limited', message: 'Please slow down. / 请稍后再试。' } }, 429);
      }
      if (path === '/mcp' || path === '/mcp/') {
        if (request.method === 'POST') {
          const body = await boundedBody(request);
          request = new Request(request.url, {
            method: 'POST',
            headers: request.headers,
            body: JSON.stringify(body),
          });
        }
        const response = await handleMcp(request);
        const headers = new Headers(response.headers);
        for (const [k, v] of Object.entries(apiHeaders)) if (k !== 'Content-Type') headers.set(k, v);
        return new Response(response.body, { status: response.status, headers });
      }
      if (request.method !== 'POST')
        return json({ error: { code: 'method_not_allowed', message: 'Use POST with a JSON body.' } }, 405);
      const raw = await boundedBody(request);
      if (path === '/api/v1/interpret') return json(await interpret(raw, request, env));
      const kind = path.match(/^\/api\/v1\/(bazi|iching|tarot|ziwei)$/)?.[1] as ToolKind | undefined;
      if (!kind) return json({ error: { code: 'not_found', message: 'Unknown endpoint.' } }, 404);
      return json(calculate(kind, raw));
    } catch (error) {
      if (error instanceof ApiError)
        return json({ error: { code: error.code, message: error.message } }, error.status);
      if (error instanceof InputError)
        return json({ error: { code: 'invalid_input', message: error.message } }, 422);
      if (error instanceof z.ZodError)
        return json(
          {
            error: {
              code: 'invalid_input',
              message: 'Please check the input fields. / 请检查填写内容。',
              fields: error.issues.map((x) => ({ path: x.path.join('.'), code: x.code })),
            },
          },
          422,
        );
      return json(
        {
          error: {
            code: 'internal_error',
            message: 'This request could not be completed. / 本次请求未完成，请稍后再试。',
          },
        },
        500,
      );
    }
  },
} satisfies ExportedHandler<Env>;
