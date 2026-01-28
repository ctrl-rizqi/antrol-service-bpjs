import { z } from "zod";

const visitEventPayloadSchema = z.object({
  jenis_kunjungan: z.number().int().min(1).max(4),
  status_poli: z.enum(["Lama", "Baru"]),
  jampraktek: z.string(),
  namapoli: z.string(),
  namadokter: z.string(),
  kuota: z.number().int().min(0),
  sisa_kuota: z.number().int().min(0),
  estimasi_dilayani: z.number(),
});

export type VisitEventPayloadAggregate = z.infer<
  typeof visitEventPayloadSchema
>;

export const validateVisitEventPayload = ({ data }: { data: unknown }) => {
  try {
    return visitEventPayloadSchema.parse(data);
  } catch (error) {
    console.log("Validasi gagal: ", error);
    throw new Error("Data tidak valid");
  }
};
