import { it, expect } from 'vitest';
import { handleMcp } from '../worker/mcp';
const call = (method: string, params: unknown = {}, path = '/mcp') =>
  handleMcp(
    new Request('https://wenbu.genedai.me' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    }),
  );
it('supports stateless MCP initialization at both slash variants', async () => {
  for (const p of ['/mcp', '/mcp/']) {
    const r = await call(
      'initialize',
      { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'test', version: '1' } },
      p,
    );
    expect(r.status).toBe(200);
    const b = (await r.json()) as { result: { serverInfo: { name: string } } };
    expect(b.result.serverInfo.name).toBe('wenbu');
  }
});
it('lists four documented tools without isolate session state', async () => {
  const r = await call('tools/list');
  const b = (await r.json()) as { result: { tools: { name: string }[] } };
  expect(b.result.tools.map((x) => x.name).sort()).toEqual([
    'calculate_bazi',
    'calculate_ziwei',
    'cast_iching',
    'draw_tarot',
  ]);
});
it('executes a tool with structured content', async () => {
  const r = await call('tools/call', { name: 'cast_iching', arguments: { lines: [7, 7, 7, 7, 7, 7] } });
  const b = (await r.json()) as { result: { structuredContent: { original: { number: number } } } };
  expect(b.result.structuredContent.original.number).toBe(1);
});
it('returns tool error for invalid data', async () => {
  const r = await call('tools/call', { name: 'calculate_bazi', arguments: { date: '2023-02-29' } });
  const b = (await r.json()) as { result: { isError: boolean } };
  expect(b.result.isError).toBe(true);
});
