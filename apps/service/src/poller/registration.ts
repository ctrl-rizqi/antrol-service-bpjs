import { fetchRegistrations } from "../khanza/khanza.query";
import prisma from "../lib/prisma";
import { validateRegistration } from "../validator/registation-validator";
import { aggregatorJadwal, AggregatedJadwal } from "../domain/quota.aggregator";
import { normalizeRegistrationDate } from "../utils/formatDate";
import { dateCursor, updateDateCursor } from "../job/cursors";
import {
  TaskProgressProps,
  validateTaskProgress,
} from "../validator/task-progress-validator";

type RegistrationRow = Awaited<ReturnType<typeof fetchRegistrations>>[number];

/**
 * Simpan registrasi ke quarantine dengan reason error
 */
async function quarantineRegistration(
  row: RegistrationRow,
  eventTime: Date,
  reason: string | string[],
  severity: "LOW" | "HIGH" = "HIGH",
) {
  const reasonText = Array.isArray(reason) ? reason.join("; ") : reason;

  try {
    await prisma.visitEventQuarantine.upsert({
      create: {
        visit_id: row.no_rawat,
        event_time: eventTime,
        reason: reasonText,
        severity,
      },
      update: {
        event_time: eventTime,
        reason: reasonText,
        severity,
      },
      where: {
        visit_id: row.no_rawat,
      },
    });

    console.log(
      `[QUARANTINE] visit_id: ${row.no_rawat}, reason: ${reasonText}`,
    );
  } catch (error) {
    console.error(
      `[ERROR] Failed to quarantine visit_id: ${row.no_rawat}`,
      error,
    );
  }
}

/**
 * Buat registrasi di visitEvent jika belum ada
 */
async function createRegistration(
  row: RegistrationRow,
  eventTime: Date,
  tanggalOnly: string,
  aggregatedData: AggregatedJadwal,
  taskProgress: TaskProgressProps,
): Promise<boolean> {
  // Cek apakah sudah ada
  const existing = await prisma.visitEvent.findUnique({
    where: { visit_id: row.no_rawat },
  });

  if (existing) {
    console.log(`[SKIP] Registration already exists: ${row.no_rawat}`);
    return false;
  }

  try {
    await prisma.visitEvent.create({
      data: {
        visit_id: row.no_rawat,
        event_time: eventTime,
        tanggal: new Date(tanggalOnly),
        jam_registrasi: row.jam_registrasi,
        poli_id: aggregatedData.kodepoli,
        dokter_id: aggregatedData.kodedokter,
        no_rkm_medis: row.no_rkm_medis,
        nomor_antrean: row.no_reg,
        angka_antrean: aggregatedData.nomorantrean,
        payload: JSON.stringify({
          jenis_kunjungan: row.jenis_kunjungan,
          status_poli: row.pasien_baru,
          kuota: aggregatedData.kuotajkn,
          sisa_kuota: aggregatedData.sisakuotajkn,
          estimasi_dilayani: aggregatedData.estimasidilayani,
        }),
        task_progress: taskProgress,
      },
    });

    console.log(`[CREATE] Registration created: ${row.no_rawat}`);
    return true;
  } catch (error) {
    console.error(
      `[ERROR] Failed to create registration: ${row.no_rawat}`,
      error,
    );
    throw error;
  }
}

/**
 * Process single registration row
 */
async function processRegistrationRow(
  row: RegistrationRow,
  taskProgress: TaskProgressProps,
) {
  const { tanggalOnly, eventTime } = normalizeRegistrationDate(
    row.tgl_registrasi,
    row.jam_registrasi,
  );

  console.log(`[PROCESS] visit_id: ${row.no_rawat}, tanggal: ${tanggalOnly}`);

  // Validasi data
  const { status, message } = validateRegistration({
    no_rawat: row.no_rawat,
    tanggal: tanggalOnly,
    jam_registrasi: row.jam_registrasi,
    poli_id: row.kd_poli,
    dokter_id: row.kd_dokter.toString(),
    jenis_kunjungan: row.jenis_kunjungan as unknown as 1 | 2 | 3 | 4,
  });

  if (!status) {
    await quarantineRegistration(row, eventTime, message, "LOW");
    return;
  }

  // Validasi berhasil, coba aggregasi
  try {
    const aggregatedData = await aggregatorJadwal(
      row.kd_dokter,
      row.kd_poli,
      tanggalOnly,
      row.jam_registrasi,
    );

    // cek apakah taskProgress valid (zod)
    validateTaskProgress(taskProgress);

    // Buat registrasi
    await createRegistration(
      row,
      eventTime,
      tanggalOnly,
      aggregatedData,
      taskProgress,
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(
      `[AGGREGATE_ERROR] visit_id: ${row.no_rawat}, error: ${errorMsg}`,
    );
    await quarantineRegistration(row, eventTime, errorMsg, "HIGH");
  }
}

// check task_id_x jika sudah ada
async function checkTaskId(row: RegistrationRow): Promise<TaskProgressProps> {
  const tasks: TaskProgressProps["task"] = [];

  // Helper untuk menambahkan task ke list
  const addTask = (id: number, dateVal: any) => {
    if (dateVal) {
      tasks.push({
        task_id: id,
        status: "DONE",
        // Gunakan tanggal dari row jika valid (Date object), jika tidak gunakan waktu sekarang
        date: dateVal instanceof Date ? dateVal : new Date(),
      });
    }
  };

  // Task 0: Data registrasi lengkap
  // Pastikan data row memiliki field mandatory sebelum menandai task 0 sebagai DONE
  if (
    row.no_rawat &&
    row.tgl_registrasi &&
    row.jam_registrasi &&
    row.kd_poli &&
    row.kd_dokter
  ) {
    tasks.push({
      task_id: 0,
      status: "DONE",
      date: new Date(),
    });
  }

  // Cek semua task_id (3-7) dan gabungkan
  addTask(3, row.task_id_3);
  addTask(4, row.task_id_4);
  addTask(5, row.task_id_5);
  addTask(6, row.task_id_6);
  addTask(7, row.task_id_7);

  return { task: tasks };
}

export async function pollRegisterEvent() {
  try {
    // Initialize cursor sekali di awal
    let cursorDate = await dateCursor({
      eventType: "REGISTER",
    });

    while (true) {
      // Helper untuk konversi ke WIB (UTC+7) agar tanggal sesuai zona waktu Indonesia
      const toWIBDateString = (date: Date) => {
        const offset = 7 * 60 * 60 * 1000;
        return new Date(date.getTime() + offset).toISOString().split("T")[0];
      };

      // Format date to YYYY-MM-DD (WIB)
      const dateString = toWIBDateString(cursorDate.date);
      const today = toWIBDateString(new Date());

      // Cek apakah cursor sudah catch up dengan hari ini
      const isCaughtUp = dateString > today;

      if (isCaughtUp) {
        console.log(
          `[POLL] Cursor caught up with today (${today}), waiting for new data...`,
        );
        // Delay lebih lama jika sudah real-time
        await new Promise((resolve) => setTimeout(resolve, 60000)); // 1 menit
        continue;
      }

      const rows = await fetchRegistrations(dateString, "00:00:00");

      console.log(
        `[POLL] Fetched ${rows.length} registrations for ${dateString}`,
      );

      let processedCount = 0;
      let errorCount = 0;

      // pengecualian pada kode poli tertentu
      // ambil semua daftar pengecualian poli
      const exceptions = await prisma.poliException.findMany({
        select: { poli_id: true },
      });
      const exceptionSet = new Set(exceptions.map((e) => e.poli_id));

      for (const row of rows) {
        // cek apakah poli di pengecualian
        if (exceptionSet.has(row.kd_poli)) {
          console.log(
            `[POLL] Skipping registration for poli exception: ${row.no_rawat}`,
          );
          processedCount++;
          continue;
        }

        try {
          const taskProgress = await checkTaskId(row);
          await processRegistrationRow(row, taskProgress);
          processedCount++;
        } catch (error) {
          errorCount++;
          console.error(
            `[ERROR] Failed to process row: ${row.no_rawat}`,
            error,
          );
        }
      }

      console.log(
        `[POLL] Processed: ${processedCount}, Errors: ${errorCount}, Total: ${rows.length}`,
      );

      // Jika semua data berhasil diproses atau sudah tidak ada data lagi,
      // update cursor ke hari berikutnya (tapi tidak melewati hari ini)
      if (rows.length === 0 || processedCount + errorCount === rows.length) {
        const nextDate = new Date(cursorDate.date);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateString = toWIBDateString(nextDate);

        // Batasi: cursor tidak boleh melewati hari ini
        if (nextDateString <= today) {
          // Update cursor di database
          await updateDateCursor({
            eventType: "REGISTER",
            newDate: nextDate,
          });

          console.log(
            `[CURSOR] Updated cursor from ${dateString} to ${nextDateString}`,
          );

          // Update local cursor
          cursorDate = { date: nextDate };
        } else {
          console.log(
            `[CURSOR] Reached limit (${today}), not advancing cursor further`,
          );
        }
      }

      // Delay sebelum poll berikutnya (5 detik untuk historical, 1 menit untuk real-time)
      const delay = isCaughtUp ? 60000 : 5000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  } catch (error) {
    console.error("[FATAL] Polling error:", error);
  }
}
