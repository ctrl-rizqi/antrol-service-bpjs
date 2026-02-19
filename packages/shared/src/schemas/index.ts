import { z } from 'zod';

export const taskIdSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(99),
]);

export const eventTaskStatusSchema = z.enum(['DONE', 'FAILED', 'SEND']);

export const visitEventPayloadSchema = z.object({
  kodebooking: z.string().min(1),
  taskid: taskIdSchema,
  waktu: z.string().datetime(),
});

export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(['admin', 'user']),
  permissions: z.array(z.string()),
});

export const weeklyStatsDataSchema = z.object({
  date: z.string(),
  day: z.string(),
  selesai: z.number(),
  belum_terkirim: z.number(),
});

export const weeklyStatsSummarySchema = z.object({
  total_selesai: z.number(),
  total_belum_terkirim: z.number(),
  total_keseluruhan: z.number(),
});

export const weeklyStatsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(weeklyStatsDataSchema),
  summary: weeklyStatsSummarySchema,
});

export const bulkRepairResultSchema = z.object({
  visit_id: z.string(),
  status: z.enum(['success', 'failed']),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const bulkRepairResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    totalProcessed: z.number(),
    successCount: z.number(),
    failedCount: z.number(),
    results: z.array(bulkRepairResultSchema),
  }),
});
