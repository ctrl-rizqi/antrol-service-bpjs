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
  const eventTime = new Date(`${tanggalOnly}T${jamRegistrasi}Z`);
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

/**
 * Parses a WIB (Western Indonesian Time, UTC+7) date string into a Date object.
 * @param wibDate The date string in "DD-MM-YYYY HH:mm:ss WIB" format.
 * @returns A Date object representing the correct moment in time in UTC.
 */
export function parseWibDateString(wibDate: string): Date {
  // wibDate format: "DD-MM-YYYY HH:mm:ss WIB"
  const parts = wibDate.split(" ");
  if (parts.length < 2) {
    throw new Error("Invalid WIB date string format");
  }
  const datePart = parts[0];
  const timePart = parts[1];

  const [day, month, year] = datePart.split("-").map(Number);
  const [hours, minutes, seconds] = timePart.split(":").map(Number);

  // Create a UTC date. Month is 0-indexed in JavaScript.
  const utcDate = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds),
  );

  // The time is in WIB (UTC+7), so we subtract 7 hours to get the actual UTC time.
  utcDate.setUTCHours(utcDate.getUTCHours() - 7);

  return utcDate;
}

export function formatToYYYYMMDD(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseBPJSDateTime(bpjsDateTime: string): Date | null {
  try {
    // Format: "06-02-2026 16:30:35 WIB"
    // Hapus " WIB" di akhir
    const cleanDateTime = bpjsDateTime.replace(" WIB", "").trim();

    // Validasi format dasar
    if (!cleanDateTime || cleanDateTime.length < 19) {
      return null;
    }

    // Split tanggal dan waktu
    const [datePart, timePart] = cleanDateTime.split(" ");

    if (!datePart || !timePart) {
      return null;
    }

    // Parse tanggal (DD-MM-YYYY)
    const [day, month, year] = datePart.split("-");

    // Parse waktu (HH:mm:ss)
    const [hours, minutes, seconds] = timePart.split(":");

    // Validasi komponen
    if (!day || !month || !year || !hours || !minutes || !seconds) {
      return null;
    }

    // Buat Date object (month di JS dimulai dari 0)
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds),
    );

    // Validasi apakah Date valid
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch (error) {
    console.error("Error parsing BPJS datetime:", error);
    return null;
  }
}
