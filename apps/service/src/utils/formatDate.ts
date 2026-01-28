// Convert UTC ke GMT+7
// Input: dateStr dalam format 'YYYY-MM-DD', timeStr dalam format 'HH:MM'
// Output: YYYY-MM-DD HH:MM:SS di GMT+7

export function formatDate(dateStr: string, timeStr: string): Date {
  const date = new Date(`${dateStr}T${timeStr}:00Z`); // Treat as UTC
  const gmtOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
  return new Date(date.getTime() + gmtOffset);
}

/**
 * Konversi tanggal ke zona waktu lokal (menghormati offset mesin) dan hasilkan
 * dua bentuk string yang sering dipakai: YYYY-MM-DD dan YYYY-MM-DD HH:MM.
 */
export function toLocalDateParts(dateInput: string | Date): {
  tanggalOnly: string;
  tanggalDateTime: string;
  localDate: Date;
} {
  const date = new Date(dateInput);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const tanggalOnly = local.toISOString().slice(0, 10);
  const tanggalDateTime = local.toISOString().slice(0, 16).replace("T", " ");

  return { tanggalOnly, tanggalDateTime, localDate: local };
}

/**
 * Utility untuk registrasi: gabungkan tanggal registrasi + jam registrasi.
 * Mengembalikan tanggal (YYYY-MM-DD), tanggal+jam (YYYY-MM-DD HH:MM), dan Date eventTime.
 */
export function normalizeRegistrationDate(
  tglRegistrasi: string | Date,
  jamRegistrasi: string,
): {
  tanggalOnly: string;
  tanggalDateTime: string;
  eventTime: Date;
} {
  const { tanggalOnly, tanggalDateTime } = toLocalDateParts(tglRegistrasi);
  const eventTime = new Date(`${tanggalOnly}T${jamRegistrasi}`);
  return { tanggalOnly, tanggalDateTime, eventTime };
}

/**
 * Mengubah input tanggal (Date atau string) menjadi Date object dimana nilai UTC-nya
 * sama persis dengan nilai "Face Value" dari input lokal.
 * Berguna untuk mengatasi pergeseran timezone saat menyimpan ke database yang menggunakan UTC.
 */
export function toFaceValueUTC(dateInput: Date | string): Date {
  if (typeof dateInput === "string") {
    const dateString = dateInput.replace(" ", "T");
    return new Date(dateString.endsWith("Z") ? dateString : dateString + "Z");
  }

  const date = new Date(dateInput);
  const offset = date.getTimezoneOffset() * 60000;
  if (offset !== 0) {
    return new Date(date.getTime() - offset);
  }
  return date;
}
