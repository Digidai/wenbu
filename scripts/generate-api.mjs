import { writeFile } from 'node:fs/promises';
const date = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'Gregorian date, 1901–2099' };
const time = { type: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' };
const locale = { type: 'string', enum: ['zh', 'en'], default: 'zh' };
const body = (properties, required = []) => ({
  type: 'object',
  additionalProperties: false,
  properties,
  required,
});
const schemas = {
  bazi: body(
    {
      date,
      time: { anyOf: [time, { type: 'null' }], default: null },
      timezone: { type: 'string', default: 'Asia/Shanghai', maxLength: 80 },
      dayBoundary: { type: 'string', enum: ['midnight', 'zi'], default: 'midnight' },
      solarTime: { type: 'boolean', default: false },
      longitude: { type: 'number', minimum: -180, maximum: 180 },
      locale,
    },
    ['date'],
  ),
  ziwei: body({ date, time, sex: { type: 'string', enum: ['male', 'female'] }, locale }, [
    'date',
    'time',
    'sex',
  ]),
  iching: body({
    lines: {
      type: 'array',
      minItems: 6,
      maxItems: 6,
      items: { type: 'integer', enum: [6, 7, 8, 9] },
      description: 'Bottom to top. Omit for cryptographic random three-coin casting.',
    },
    locale,
  }),
  tarot: body({
    count: { type: 'integer', enum: [1, 3], default: 3 },
    reversals: { type: 'boolean', default: true },
    locale,
  }),
};
const paths = Object.fromEntries(
  Object.entries(schemas).map(([kind, schema]) => [
    '/api/v1/' + kind,
    {
      post: {
        operationId: {
          bazi: 'calculate_bazi',
          iching: 'cast_iching',
          tarot: 'draw_tarot',
          ziwei: 'calculate_ziwei',
        }[kind],
        summary: 'Calculate or draw ' + kind + ' symbols',
        description:
          'No authentication. Cultural reflection, not established prediction. JSON body capped at 8192 bytes. Rate limits apply.',
        requestBody: { required: true, content: { 'application/json': { schema } } },
        responses: {
          200: {
            description: 'Structured result including method and conventions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['kind', 'version', 'method'],
                  properties: {
                    kind: { const: kind },
                    version: { type: 'string' },
                    method: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid JSON' },
          403: { description: 'Browser origin rejected' },
          413: { description: 'Request too large' },
          415: { description: 'JSON content type required' },
          422: { description: 'Invalid input or ambiguous date/time' },
          429: { description: 'Request limit reached' },
        },
      },
    },
  ]),
);
paths['/api/v1/interpret'] = {
  post: {
    operationId: 'interpret_reading',
    summary: 'Optional metered AI interpretation',
    description:
      'User must explicitly consent. Recomputes supplied chart data. Five attempts per network per Shanghai day; global budget 1000 attempts. Upstream attempts count even if they fail. Tarot input is cards [{id:0..77,reversed:boolean}] with 1 or 3 unique cards. Other inputs follow their calculation schema; I Ching requires the original lines.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: body(
            {
              kind: { type: 'string', enum: Object.keys(schemas) },
              input: { type: 'object' },
              question: { type: 'string', minLength: 2, maxLength: 600 },
              context: { type: 'string', maxLength: 1600, default: '' },
              locale,
              consent: { const: true },
            },
            ['kind', 'input', 'question', 'consent'],
          ),
        },
      },
    },
    responses: {
      200: {
        description:
          'Validated structured interpretation, remaining allowance and requested/served model provenance',
      },
      422: { description: 'Invalid input or missing consent' },
      429: { description: 'Daily allowance or global budget reached' },
      502: { description: 'Incomplete upstream response' },
      503: { description: 'AI unavailable' },
    },
  },
};
await writeFile(
  'public/openapi.json',
  JSON.stringify(
    {
      openapi: '3.1.0',
      info: {
        title: 'Wenbu · 问卜',
        version: '1.0.0',
        description: 'Free, transparent cultural calculation tools. No predictive validity claims.',
        license: { name: 'MIT', identifier: 'MIT' },
      },
      servers: [{ url: 'https://wenbu.genedai.me' }],
      paths,
    },
    null,
    2,
  ) + '\n',
);
await writeFile(
  'public/context.schema.json',
  JSON.stringify(
    {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'https://wenbu.genedai.me/context.schema.json',
      title: 'Wenbu user-selected context',
      type: 'object',
      additionalProperties: false,
      required: [
        'schema',
        'version',
        'kind',
        'createdAt',
        'calculation',
        'question',
        'selectedContext',
        'birthDetailsIncluded',
        'instructions',
      ],
      properties: {
        schema: { const: 'https://wenbu.genedai.me/context.schema.json' },
        version: { const: 1 },
        kind: { enum: Object.keys(schemas) },
        createdAt: { type: 'string', format: 'date-time' },
        calculation: {
          type: 'object',
          description:
            'Calculation output. Original birth fields only when deliberately included. Symbols themselves may still be identifying.',
        },
        question: { type: 'string', maxLength: 600 },
        selectedContext: { type: 'string', maxLength: 1600 },
        birthDetailsIncluded: { type: 'boolean' },
        instructions: { type: 'string' },
      },
    },
    null,
    2,
  ) + '\n',
);
