import { z } from "zod";

// Schema
const taskSchema = z.object({
  task_id: z.number().int().min(0).max(7),
  status: z.enum(["DONE", "FAILED", "SEND"]),
  date: z.date(),
  original_date: z.date().optional(),
});

const taskProgressSchema = z.object({
  task: z.array(taskSchema),
});

export type TaskProgressProps = z.infer<typeof taskProgressSchema>;

// Validator
export const validateTaskProgress = (data: unknown) => {
  try {
    return taskProgressSchema.parse(data);
  } catch (error) {
    console.log("Validasi gagal: ", error);
    throw new Error("Data tidak valid");
  }
};
