import { z } from "zod";

const validateRegistrationSchema = z.object({
  no_rawat: z.string(),
  tanggal: z.string(),
  jam_registrasi: z
    .string()
    .regex(/^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/),
  poli_id: z.string(),
  dokter_id: z.coerce.number().min(0).max(999999999).default(0),
  jenis_kunjungan: z.number().int().min(1).max(4),
});

export type validateRegistrationParams = z.infer<
  typeof validateRegistrationSchema
>;

export function validateRegistration({ data }: { data: unknown }) {
  const result = validateRegistrationSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Ambil pesan error detail dari Zod agar tahu kenapa data ditolak
  const message = z.treeifyError(result.error);

  return { success: false, message };
}
