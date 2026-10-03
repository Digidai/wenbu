import { it, expect } from 'vitest';
import { handleMcp } from '../worker/mcp';
const call = (
  method: string,
  params: unknown = {},
  path = '/mcp',
  receipt?: Parameters<typeof handleMcp>[1],
) =>
  handleMcp(
    new Request('https://wenbu.app' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    }),
    receipt,
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
it('lists six documented tools without isolate session state', async () => {
  const r = await call('tools/list');
  const b = (await r.json()) as { result: { tools: { name: string }[] } };
  expect(b.result.tools.map((x) => x.name).sort()).toEqual([
    'calculate_bazi',
    'calculate_ziwei',
    'cast_iching',
    'draw_tarot',
    'read_library',
    'search_library',
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

it('searches and reads original library content with stable source IDs', async () => {
  const result = (await (
    await call('tools/call', { name: 'search_library', arguments: { query: '真太阳时', locale: 'zh' } })
  ).json()) as { result: { structuredContent: { results: { id: string; kind: string }[] } } };
  const doc = result.result.structuredContent.results.find((d) => d.kind === 'guide');
  expect(doc).toBeDefined();
  const read = (await (
    await call('tools/call', { name: 'read_library', arguments: { id: doc!.id, locale: 'zh' } })
  ).json()) as { result: { structuredContent: { source: { id: string }; content: string } } };
  expect(read.result.structuredContent.source.id).toBe(doc!.id);
  expect(read.result.structuredContent.content.length).toBeGreaterThan(100);
});

it('records one enclosing call for calculations, library reads and SDK validation failures', async () => {
  for (const [params, success, calculated] of [
    [{ name: 'cast_iching', arguments: { lines: [7, 7, 7, 7, 7, 7] } }, true, true],
    [{ name: 'search_library', arguments: { query: 'bazi' } }, true, false],
    [{ name: 'calculate_bazi', arguments: { date: '2023-02-29' } }, false, false],
    [{ name: 'calculate_bazi', arguments: { date: 123 } }, false, false],
    [{ name: 'nonexistent_tool', arguments: {} }, false, false],
  ] as const) {
    const receipts: { tool: string; success: boolean }[] = [];
    await call('tools/call', params, '/mcp', (tool, success) => receipts.push({ tool, success }));
    expect(receipts.filter((r) => r.tool === 'mcp')).toEqual([{ tool: 'mcp', success }]);
    expect(receipts.filter((r) => r.tool !== 'mcp')).toHaveLength(calculated ? 1 : 0);
  }
  const receipts: unknown[] = [];
  await call('tools/list', {}, '/mcp', (...receipt) => receipts.push(receipt));
  expect(receipts).toEqual([]);
});
