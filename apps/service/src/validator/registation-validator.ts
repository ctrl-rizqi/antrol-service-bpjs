interface validateRegistrationParams {
  no_rawat: string;
  tanggal: string;
  jam_registrasi: string;
  poli_id: string;
  dokter_id: string;
  jenis_kunjungan: 1 | 2 | 3 | 4;
}

export function validateRegistration({
  no_rawat,
  tanggal,
  jam_registrasi,
  poli_id,
  dokter_id,
  jenis_kunjungan,
}: validateRegistrationParams): {
  status: boolean;
  message: string[];
} {
  let status = true;
  const message: string[] = [];
  // cek semua field harus ada
  if (
    !no_rawat ||
    !tanggal ||
    !jam_registrasi ||
    !poli_id ||
    !dokter_id ||
    !jenis_kunjungan
  ) {
    status = false;
    message.push("Semua field harus diisi");
  }

  // cek no_rawat harus string dan tidak kosong
  // contoh: 2026/01/24/005403
  const noRawatPattern = /^\d{4}\/\d{2}\/\d{2}\/\d{6}$/;
  if (typeof no_rawat !== "string" || !noRawatPattern.test(no_rawat)) {
    status = false;
    message.push(
      "NO_RAWAT: harus berupa string dan tidak kosong, output: " + no_rawat,
    );
  }

  // tanggal harus valid date
  // contoh: 2026-01-20
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof tanggal !== "string" || !datePattern.test(tanggal)) {
    status = false;
    message.push(
      "TANGGAL: harus berupa string dan tidak kosong, output: " + tanggal,
    );
  }

  // jam_registrasi harus valid time HH:MM:SS
  // contoh: 00:00:00
  const timePattern = /^\d{2}:\d{2}:\d{2}$/;
  if (typeof jam_registrasi !== "string" || !timePattern.test(jam_registrasi)) {
    status = false;
    message.push(
      "JAM_REGISTRASI: harus berupa string dan tidak kosong, output: " +
        jam_registrasi,
    );
  }

  // poli_id harus string dan tidak kosong
  if (typeof poli_id !== "string" || !poli_id) {
    status = false;
    message.push(
      "POLI_ID: harus berupa string dan tidak kosong, output: " + poli_id,
    );
  }

  // dokter_id harus string dan tidak kosong
  if (typeof dokter_id !== "string" || !dokter_id) {
    status = false;
    message.push(
      "DOKTER_ID: harus berupa string dan tidak kosong, output: " + dokter_id,
    );
  }

  // jenis_kunjungan harus 1, 2, 3, atau 4
  if (![1, 2, 3, 4].includes(jenis_kunjungan)) {
    status = false;
    message.push(
      "JENIS_KUNJUNGAN: harus salah satu dari 1, 2, 3, atau 4, output: " +
        jenis_kunjungan,
    );
  }

  return {
    status,
    message,
  };
}
