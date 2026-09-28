import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { calculateBazi } from '../src/lib/bazi';
import { castIching } from '../src/lib/iching';
import { drawTarot } from '../src/lib/tarot';
import { calculateZiwei } from '../src/lib/ziwei';

const language = z.enum(['zh', 'en']).default('en');
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const pack = (data: Record<string, unknown>) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data) }],
  structuredContent: data,
});

export function createMcpServer() {
  const server = new McpServer(
    { name: 'wenbu', version: '1.0.0' },
    {
      instructions:
        'Wenbu provides cultural reflection tools, not factual predictions. Only send birth details the user explicitly chooses to share. Preserve all calculation conventions and warnings. Use your host model to interpret the returned data; Wenbu MCP does not need an AI key.',
    },
  );
  const register = (
    name: string,
    description: string,
    inputSchema: Record<string, z.ZodType>,
    fn: (a: unknown) => Record<string, unknown>,
    random = false,
  ) => {
    server.registerTool(
      name,
      {
        description,
        inputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: !random,
          openWorldHint: false,
        },
      },
      async (args) => {
        try {
          return pack(fn(args));
        } catch {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: 'Invalid input. Check the date, timezone and required fields. No chart was generated.',
              },
            ],
          };
        }
      },
    );
  };
  register(
    'calculate_bazi',
    'Calculate four pillars. Unknown time returns no hour pillar. Gregorian date, IANA timezone, explicit day boundary. No prediction.',
    {
      date,
      time: time.nullable().default(null),
      timezone: z.string().default('Asia/Shanghai'),
      dayBoundary: z.enum(['midnight', 'zi']).default('midnight'),
      solarTime: z.boolean().default(false),
      longitude: z.number().min(-180).max(180).optional(),
      locale: language,
    },
    calculateBazi,
  );
  register(
    'cast_iching',
    'Cast six three-coin lines or supply your own. Lines are ordered bottom to top, values 6/7/8/9. Returns original and changed King Wen hexagrams.',
    {
      lines: z
        .array(z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]))
        .length(6)
        .optional(),
      locale: language,
    },
    castIching,
    true,
  );
  register(
    'draw_tarot',
    'Draw one or three cards from a full 78-card deck without replacement. Reversals optional. Symbolic reflection only.',
    {
      count: z.union([z.literal(1), z.literal(3)]).default(3),
      reversals: z.boolean().default(true),
      locale: language,
    },
    drawTarot,
    true,
  );
  register(
    'calculate_ziwei',
    'Calculate Zi Wei Dou Shu twelve palaces from an entered local civil date and known time. iztro default school, no solar-time correction. Sex is a traditional calculation parameter.',
    { date, time, sex: z.enum(['male', 'female']), locale: language },
    calculateZiwei,
  );
  server.registerResource('methodology', 'wenbu://methodology', { mimeType: 'text/plain' }, async () => ({
    contents: [
      {
        uri: 'wenbu://methodology',
        mimeType: 'text/plain',
        text: 'Wenbu v1.0. BaZi: lunar-typescript 1.8.6; solar-term year/month at the absolute instant in Asia/Shanghai; day/hour in local civil or approximate solar time. I Ching: cryptographic three-coin probabilities 1/8,3/8,3/8,1/8; bottom-to-top lines; changing lines 6 and 9. Tarot: uniform selection without replacement, optional independent 50% reversals. Zi Wei: iztro 2.6.1 local civil time, fixLeap=true, default school. Details: https://wenbu.genedai.me/en/methodology/',
      },
    ],
  }));
  return server;
}
export async function handleMcp(request: Request) {
  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  // JSON-only stateless operation: no isolate-local session map or private-data storage.
  try {
    return await transport.handleRequest(request);
  } finally {
    await server.close();
  }
}
