import { z } from "zod";
import { noContentResponseSchema } from "../utils/NoContentResponse";

// Schema untuk single task item
export const listTaskSchema = z.object({
  wakturs: z.string(),
  waktu: z.string(),
  taskname: z.string(),
  taskid: z.number(),
  kodebooking: z.string(),
});

// Schema untuk array of tasks
export const listTasksArraySchema = z.array(listTaskSchema);

export type ListTask = z.infer<typeof listTaskSchema>;
export type ListTasksArray = z.infer<typeof listTasksArraySchema>;

// Validasi untuk array of tasks
export const validateListTask = ({ data }: { data: unknown }) => {
  try {
    return listTasksArraySchema.parse(data);
  } catch (error) {
    console.log("Validasi gagal: ", error);
    throw new Error("Data tidak valid");
  }
};

export const apiResponseSchema = z.union([
  listTasksArraySchema,
  noContentResponseSchema,
]);

export type ListTaskResponse = z.infer<typeof apiResponseSchema>;
