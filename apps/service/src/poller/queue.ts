import { sendToBpjs } from "../bpjs/bpjs.client";
import { dateCursor, updateDateCursor } from "../domain/cursors";
import prisma from "../lib/prisma";
import {
  RegistrationPayload,
  validateRegistrationPayload,
  validateUpdateTaskPayload,
} from "../validator/payload-validator";
import {
  validateVisitEventPayload,
  VisitEventPayloadAggregate,
} from "../validator/payload-visitEvent";

const MAX_RETRY = 5;
const RETRY_DELAY = 5000; // 5 detik

// Mapping dependency: Task ID -> Task ID sebelumnya yang harus berstatus SEND
const TASK_DEPENDENCY: Record<number, number> = {
  3: 0, // Task 3 butuh Task 0 (Registrasi) selesai
  4: 3, // Task 4 butuh Task 3 selesai
  5: 4,
  6: 5,
  7: 6,
};

export async function processRegistrationTask(
  task: any,
  force: boolean = false,
) {
  // 1. Cek Retry Count: Hitung berapa kali task ini sudah gagal sebelumnya
  if (!force) {
    const retryCount = await prisma.visitEventLog.count({
      where: {
        visit_id: task.VisitEvent.visit_id,
        task_id: task.task_id.toString(),
        http_code: { not: 200 }, // Hitung yang gagal saja
      },
    });

    if (retryCount >= MAX_RETRY) {
      console.log(
        `[GIVE UP] Task ${task.id} exceeded max retry (${MAX_RETRY})`,
      );
      await prisma.eventTask.update({
        where: { id: task.id },
        data: { status: "FAILED" },
      });
      return; // Skip proses selanjutnya
    }
  }

  const parsedPayload = JSON.parse(task.VisitEvent.payload?.toString() || "{}");

  // Validasi aggregasi
  const payloadVisitEvent = validateVisitEventPayload({
    data: parsedPayload,
  });

  // Kumpulkan semua payload
  const payload: RegistrationPayload = {
    kodebooking: task.VisitEvent.visit_id,
    jenispasien: "NON JKN",
    nomorkartu: "-",
    nik: "-",
    nohp: "-",
    kodepoli: task.VisitEvent.poli_id,
    namapoli: payloadVisitEvent.namapoli,
    pasienbaru: payloadVisitEvent.status_poli === "Lama" ? 0 : 1,
    norm: task.VisitEvent.no_rkm_medis,
    tanggalperiksa: task.VisitEvent.tanggal.toISOString().split("T")[0],
    kodedokter: Number(task.VisitEvent.dokter_id),
    namadokter: payloadVisitEvent.namadokter,
    jampraktek: payloadVisitEvent.jampraktek,
    jeniskunjungan: payloadVisitEvent.jenis_kunjungan,
    nomorreferensi: "-",
    nomorantrean: task.VisitEvent.nomor_antrean?.toString() || "0",
    angkaantrean: task.VisitEvent.angka_antrean || 0,
    estimasidilayani: payloadVisitEvent.estimasi_dilayani,
    sisakuotajkn: payloadVisitEvent.sisa_kuota,
    kuotajkn: payloadVisitEvent.kuota,
    sisakuotanonjkn: payloadVisitEvent.sisa_kuota,
    kuotanonjkn: payloadVisitEvent.kuota,
    keterangan: "Harap datang 30 menit sebelum jam periksa",
  };

  // Validasi payload
  validateRegistrationPayload({ data: payload });

  try {
    // Kirim ke BPJS
    const response = await sendToBpjs("/antrean/add", payload);

    // simpan log pengiriman dan update status task
    // 200 = sukses, 208 = duplikasi (dianggap sebagai sukses)
    const responseCode = response.data?.metadata?.code;

    if (responseCode === 200 || responseCode === 208) {
      await prisma.$transaction(async (tx) => {
        // Update status task menjadi SEND (Sukses)
        await tx.eventTask.update({
          where: { id: task.id },
          data: { status: "SEND" },
        });

        // Update log pengiriman
        await tx.visitEventLog.create({
          data: {
            visit_id: task.VisitEvent.visit_id,
            task_id: task.task_id.toString(),
            event_time: task.VisitEvent.event_time,
            payload: JSON.stringify(payload),
            http_code: responseCode,
            last_error: response.data?.metadata?.message || "Unknown Error",
            sentAt: new Date(),
          },
        });
      });
    } else {
      // Log error (Status task tetap DONE agar dicoba lagi di putaran berikutnya sampai MAX_RETRY)
      await prisma.visitEventLog.create({
        data: {
          visit_id: task.VisitEvent.visit_id,
          task_id: task.task_id.toString(),
          event_time: task.VisitEvent.event_time,
          payload: JSON.stringify(payload),
          http_code: responseCode,
          last_error: response.data?.metadata?.message || "Unknown Error",
          sentAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error(`[ERROR] Failed to send task ${task.id}`, error);
  }
}

export async function processUpdateTask(task: any, force: boolean = false) {
  // 1. Cek Dependency
  const requiredPrevId = TASK_DEPENDENCY[task.task_id];
  const prevTask = task.VisitEvent.EventTasks.find(
    (t: any) => t.task_id === requiredPrevId,
  );

  // Validasi: Task sebelumnya harus sudah SEND
  if (!prevTask || prevTask.status !== "SEND") {
    // Jika task sebelumnya FAILED, maka task ini juga kita gagalkan agar tidak nyangkut selamanya
    if (prevTask?.status === "FAILED") {
      await prisma.eventTask.update({
        where: { id: task.id },
        data: { status: "FAILED" },
      });
    }
    return; // Skip, tunggu antrean sebelumnya selesai
  }

  // 2. Cek Retry Count
  if (!force) {
    const retryCount = await prisma.visitEventLog.count({
      where: {
        visit_id: task.VisitEvent.visit_id,
        task_id: task.task_id.toString(),
        http_code: { not: 200 },
      },
    });

    if (retryCount >= MAX_RETRY) {
      await prisma.eventTask.update({
        where: { id: task.id },
        data: { status: "FAILED" },
      });
      return;
    }
  }

  // 3. Kirim ke BPJS (Update Waktu)
  const timeOffset = 7 * 60 * 60 * 1000;
  const payload = {
    kodebooking: task.VisitEvent.visit_id,
    taskid: task.task_id,
    waktu: task.event_time.getTime() - timeOffset, // Unix miliseconds, contoh: 1616559330000
  };

  // Validasi Payload
  validateUpdateTaskPayload({ data: payload });

  try {
    const response = await sendToBpjs("/antrean/updatewaktu", payload);
    const responseCode = response.data?.metadata?.code;

    if (responseCode === 200 || responseCode === 208) {
      await prisma.$transaction(async (tx) => {
        await tx.eventTask.update({
          where: { id: task.id },
          data: { status: "SEND" },
        });

        await tx.visitEventLog.create({
          data: {
            visit_id: task.VisitEvent.visit_id,
            task_id: task.task_id.toString(),
            event_time: task.event_time,
            payload: JSON.stringify(payload),
            http_code: responseCode,
            last_error: response.data?.metadata?.message || "Unknown Error",
            sentAt: new Date(),
          },
        });
      });
    } else {
      await prisma.visitEventLog.create({
        data: {
          visit_id: task.VisitEvent.visit_id,
          task_id: task.task_id.toString(),
          event_time: task.event_time,
          payload: JSON.stringify(payload),
          http_code: responseCode,
          last_error: response.data?.metadata?.message || "Unknown Error",
          sentAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error(`[ERROR] Failed to send task ${task.id}`, error);
  }
}

export async function pollQueueRegistration() {
  // Initialize cursor sekali di awal
  let cursorDate = await dateCursor({
    eventType: "REGISTER", // Pengiriman Registrasi
  });

  // Loop polling
  while (true) {
    try {
      console.log(
        `0️⃣ [POLL] Polling queue registration... (cursor: ${cursorDate.date})`,
      );
      // Ambil data yang memiliki setidaknya satu task dengan status "DONE"
      // Filter tanggal dihapus agar bisa memproses ulang data lama yang mungkin tersangkut
      const tasks = await prisma.eventTask.findMany({
        take: 10, // Ambil 10 data per batch untuk diproses paralel
        where: {
          status: "DONE",
          task_id: 0,
        },
        include: {
          VisitEvent: true,
        },
        orderBy: {
          event_time: "asc", // Proses yang paling lama dulu
        },
      });

      if (tasks.length > 0) {
        // Kirim ke BPJS
        // Gunakan Promise.all untuk mengirim secara paralel (meningkatkan performa)
        await Promise.all(tasks.map((t) => processRegistrationTask(t)));

        // Beri jeda antar batch agar tidak membebani server/API BPJS (Rate Limiting sederhana)
        // Ini juga berfungsi sebagai delay untuk retry jika ada task yang gagal dan diambil lagi di batch berikutnya
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else {
        // Sudah tidak ada antrean, tunggu data baru
        await new Promise((resolve) => setTimeout(resolve, 60000)); // 1 menit
      }
    } catch (error) {
      console.error("[ERROR] Queue poller iteration failed:", error);
      // Beri jeda saat error agar tidak hot-loop
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

export async function pollQueueTask() {
  // Intialize cursor sekali di awal
  let cursorDate = await dateCursor({
    eventType: "CHECKIN",
  });

  // Loop polling
  while (true) {
    try {
      console.log(
        `🔼 [POLL] Polling queue task... (cursor: ${cursorDate.date})`,
      );

      // Ambil data yang task_id 3-7 dan status DONE
      // Filter tanggal dihapus agar bisa memproses ulang data lama yang mungkin tersangkut
      const tasks = await prisma.eventTask.findMany({
        take: 10,
        where: {
          status: "DONE",
          task_id: { in: [3, 4, 5, 6, 7] },
        },
        include: {
          VisitEvent: {
            include: {
              EventTasks: true, // Ambil semua task untuk cek dependency
            },
          },
        },
        orderBy: {
          event_time: "asc", // Proses yang paling lama dulu
        },
      });

      if (tasks.length > 0) {
        await Promise.all(tasks.map((t) => processUpdateTask(t)));

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else {
        // Sudah tidak ada antrean, tunggu data baru
        await new Promise((resolve) => setTimeout(resolve, 60000)); // 1 menit
      }
    } catch (error) {
      console.error("[ERROR] Queue task poller iteration failed:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
