import { z } from "zod";

// Schema untuk response kosong (No Content)
export const noContentResponseSchema = z.object({
  metadata: z.object({
    code: z.number(),
    message: z.string(),
  }),
});

export type NoContentResponse = z.infer<typeof noContentResponseSchema>;
