import { z } from 'zod';

export const localeSchema = z.enum(['zh', 'en']).default('zh');
export const birthSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable()
      .default(null),
    timezone: z.string().min(1).max(80).default('Asia/Shanghai'),
    dayBoundary: z.enum(['midnight', 'zi']).default('midnight'),
    solarTime: z.boolean().default(false),
    longitude: z.number().min(-180).max(180).optional(),
    locale: localeSchema,
  })
  .strict()
  .refine((v) => !v.solarTime || (v.longitude !== undefined && v.time !== null), {
    message: 'Solar time requires longitude and a known birth time.',
  });
export const ziweiSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    sex: z.enum(['male', 'female']),
    locale: localeSchema,
  })
  .strict();
export const castSchema = z
  .object({
    lines: z
      .array(z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]))
      .length(6)
      .optional(),
    locale: localeSchema,
  })
  .strict();
export const tarotSchema = z
  .object({
    count: z.union([z.literal(1), z.literal(3)]).default(3),
    reversals: z.boolean().default(true),
    locale: localeSchema,
  })
  .strict();
export type BirthInput = z.infer<typeof birthSchema>;
export type Locale = z.infer<typeof localeSchema>;
export type ToolKind = 'bazi' | 'iching' | 'tarot' | 'ziwei';
export const interpretationSchema = z
  .object({
    kind: z.enum(['bazi', 'iching', 'tarot', 'ziwei']),
    input: z.unknown(),
    question: z.string().trim().min(2).max(600),
    context: z.string().max(1600).default(''),
    locale: localeSchema,
    consent: z.literal(true),
  })
  .strict();

export class InputError extends Error {}
