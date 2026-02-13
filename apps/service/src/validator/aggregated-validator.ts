import { z } from "zod";

const AggregatedJadwalSchema = z.object({
  kodedokter: z.coerce.number().int().min(0).max(999999999).default(0),
  namadokter: z.string(),
  kodepoli: z.string(),
  namapoli: z.string(),
  nomorantrean: z.number().int().min(0),
  jampraktek: z
    .string()
    .regex(
      /^([01][0-9]|2[0-3]):([0-5][0-9])\-([01][0-9]|2[0-3]):([0-5][0-9])$/,
    ),
  kuotajkn: z.number().int().min(0),
  sisakuotajkn: z.number().int().min(0),
  kuotanonjkn: z.number().int().min(0),
  sisakuotanonjkn: z.number().int().min(0),
  estimasidilayani: z.number().int().min(0),
});

export type AggregatedJadwal = z.infer<typeof AggregatedJadwalSchema>;

export const validateAggregatedJadwal = ({ data }: { data: unknown }) => {
  try {
    return AggregatedJadwalSchema.parse(data);
  } catch (error) {
    console.log("Validasi gagal: ", error);
    throw new Error("Data (agregasi) tidak valid");
  }
};
