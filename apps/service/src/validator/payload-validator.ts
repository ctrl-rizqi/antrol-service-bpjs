import { z } from "zod";

// Schema
const registrationPayloadSchema = z.object({
  kodebooking: z.string(),
  jenispasien: z.enum(["NON JKN"]),
  nomorkartu: z.string().default("-"),
  nik: z.string().default("-"),
  nohp: z.string().default("-"),
  kodepoli: z.string(), // required
  namapoli: z.string(), // required
  pasienbaru: z.number().int().min(0).max(1).default(0), // required, 0 = lama, 1 = baru
  norm: z.string(),
  tanggalperiksa: z.string(), // YYYY-MM-DD
  kodedokter: z.number().int().min(0).max(999999999).default(0), // required
  namadokter: z.string(), // required
  jampraktek: z.string(), // required HH:MM-HH:MM
  jeniskunjungan: z.number().int().min(1).max(4).default(1), // required, 1 = reguler, 2 = klinik, 3 = rawat inap, 4 = rawat jalan
  nomorreferensi: z.string().default("-"),
  nomorantrean: z.string().default("0"),
  angkaantrean: z.number().default(0),
  estimasidilayani: z.number().default(0),
  sisakuotajkn: z.number().default(0),
  kuotajkn: z.number().default(0),
  sisakuotanonjkn: z.number().default(0),
  kuotanonjkn: z.number().default(0),
  keterangan: z.string().default("Harap datang 30 menit sebelum jam periksa"),
});

export type RegistrationPayload = z.infer<typeof registrationPayloadSchema>;

// Validator
export const validateRegistrationPayload = ({ data }: { data: unknown }) => {
  try {
    return registrationPayloadSchema.parse(data);
  } catch (error) {
    console.log("Validasi gagal: ", error);
    throw new Error("Data tidak valid");
  }
};

const updateTaskPayloadSchema = z.object({
  kodebooking: z.string(),
  taskid: z.number().int().min(0).max(7),
  waktu: z.number().int().min(0), // Unix miliseconds
});

export type UpdateTaskPayload = z.infer<typeof updateTaskPayloadSchema>;

export const validateUpdateTaskPayload = ({ data }: { data: unknown }) => {
  try {
    return updateTaskPayloadSchema.parse(data);
  } catch (error) {
    console.log("Validasi gagal: ", error);
    throw new Error("Data tidak valid");
  }
};
