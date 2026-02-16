import { Router } from "express";
import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { paginate } from "../utils/pagination";
import {
  getPendaftaranAntreanByTanggal,
  getListTaskByKodebooking,
} from "../bpjs/bpjs.client";
import { formatToYYYYMMDD, parseBPJSDateTime } from "../utils/formatDate";
import { fetchRegistrationByNoReg, insertTaskId } from "../khanza/khanza.query";
import { generateTaskTime } from "../utils/generateTime";
import { checkTaskId, processRegistrationRow } from "../poller/registration";
import { processRegistrationTask, processUpdateTask } from "../poller/queue";

const router: Router = Router();

// Mengambil daftar pendaftaran antrean per tanggal
router.get("/", async (req: Request, res: Response) => {
  const { tanggal } = req.query as { tanggal: string };

  // cek apakah tanggal ada
  if (!tanggal) {
    return res.status(400).json({
      success: false,
      message: "Parameter tanggal diperlukan",
    });
  }

  try {
    // ambil data dari databse
    const snapshot = await paginate(prisma.registrationSnapshot, req, {
      where: {
        tanggal: new Date(tanggal),
      },
      orderBy: {
        event_time: "desc",
      },
    });

    // kirim response
    return res.json({
      success: true,
      ...snapshot,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data pendaftaran antrean",
      error: (error as Error).message,
    });
  }
});

// Singkronasikan pendaftaran antrean dari BPJS berdasarkan tanggal
router.post("/sync", async (req: Request, res: Response) => {
  const { tanggal } = req.body as { tanggal: string };

  // cek apakah tanggal ada
  if (!tanggal) {
    return res.status(400).json({
      success: false,
      message: "Parameter tanggal diperlukan",
    });
  }

  try {
    // panggil client BPJS untuk ambil data pendaftaran antrean
    const pendaftaranAntrean = await getPendaftaranAntreanByTanggal(tanggal);

    // jika array kosong
    if (pendaftaranAntrean.length === 0) {
      return res.json({
        success: true,
        message: "Tidak ada data pendaftaran antrean untuk disinkronkan",
      });
    }

    // simpan ke database
    const createPromises = pendaftaranAntrean.map((pendaftaran) => {
      const data = {
        visit_id: pendaftaran.kodebooking,
        event_time: pendaftaran.createdtime.toString(), // unix datetime
        event_time_datetime: new Date(formatToYYYYMMDD(pendaftaran.tanggal)), // konversi ke DateTime (ISO-8601)
        no_rkm_medis: pendaftaran.norekammedis,
        sumber_data: pendaftaran.sumberdata,
        tanggal: new Date(pendaftaran.tanggal), // Atau new Date(pendaftaran.tanggal) jika DateTime
        kodedokter: pendaftaran.kodedokter, // Output: number
        kodepoli: pendaftaran.kodepoli,
        status_peserta: pendaftaran.ispeserta,
        status_kunjungan: pendaftaran.status === "Selesai dilayani",
        payload: pendaftaran as any,
        fetchedAt: new Date(),
      };

      return prisma.registrationSnapshot.upsert({
        where: { visit_id: pendaftaran.kodebooking },
        update: data,
        create: data,
      });
    });

    await Promise.all(createPromises);

    return res.json({
      success: true,
      message: `Berhasil menyinkronkan ${pendaftaranAntrean.length} data pendaftaran antrean`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyinkronkan data pendaftaran antrean",
      error: (error as Error).message,
    });
  }
});

/**
 * Endpoint ini akan mengenerate task_id_3, task_id_4, task_id_5, task_id_6, dan task_id_7
 * berdasarkan visit_id (nomor registrasi) yang diberikan.
 *
 * ⚠️ Harap diperhatikan bahwa implementasi ini perlu pertimbangan lebih lanjut
 * terkait sumber data dan logika bisnis yang tepat untuk menghasilkan task_id tersebut.
 * Segala bentuk resiko akibat penggunaan endpoint ini menjadi tanggung jawab pengguna.
 */
router.post("/autorepair", async (req: Request, res: Response) => {
  const { visit_id } = req.body as { visit_id: string };

  // cek apakah tanggal ada
  if (!visit_id) {
    return res.status(400).json({
      success: false,
      message: "Parameter visit_id diperlukan",
    });
  }

  try {
    let task_id_3: Date,
      task_id_4: Date,
      task_id_5: Date,
      task_id_6: Date,
      task_id_7: Date | undefined;

    // ambil waktu registrasi dari khanza
    const patientRegistration = await fetchRegistrationByNoReg(visit_id);

    const registrationDate = new Date(
      patientRegistration?.tgl_registrasi || "",
    );
    const [hours, minutes, seconds] = (
      patientRegistration?.jam_registrasi || "00:00:00"
    ).split(":");

    const registrationDateTime = new Date(registrationDate);
    registrationDateTime.setHours(
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds),
    );

    let pendaftaranAntrean: any[] = [];

    try {
      pendaftaranAntrean = await getListTaskByKodebooking(visit_id);

      // validasi response
      if (!Array.isArray(pendaftaranAntrean)) {
        console.warn("Response BPJS bukan array");
        pendaftaranAntrean = [];
      }
    } catch (error) {
      pendaftaranAntrean = [];
    }

    // Helper untuk mendapatkan waktu dari BPJS atau generate
    // Helper untuk mendapatkan waktu dari BPJS atau generate
    const getTaskTime = (
      taskId: number,
      baseTime: Date,
      minDelay: number,
      maxDelay: number,
    ): Date => {
      try {
        const bpjsTask = pendaftaranAntrean.find((p) => p?.taskid === taskId);

        // Pengecekan lengkap
        if (
          bpjsTask &&
          typeof bpjsTask.wakturs === "string" &&
          bpjsTask.wakturs.trim().length > 0
        ) {
          const parsedDate = parseBPJSDateTime(bpjsTask.wakturs);

          if (parsedDate) {
            console.log(
              `Task ${taskId} menggunakan waktu dari BPJS:`,
              parsedDate,
            );
            return parsedDate;
          } else {
            console.warn(
              `Task ${taskId} format waktu BPJS invalid:`,
              bpjsTask.wakturs,
            );
          }
        } else {
          console.log(
            `Task ${taskId} tidak ditemukan di BPJS atau wakturs kosong`,
          );
        }
      } catch (error) {
        console.error(`Error processing task ${taskId} from BPJS:`, error);
      }

      // Fallback: generate otomatis
      const generatedDate = generateTaskTime(
        visit_id,
        baseTime,
        minDelay,
        maxDelay,
      );
      console.log(`Task ${taskId} di-generate:`, generatedDate);
      return generatedDate;
    };

    task_id_3 = getTaskTime(3, registrationDateTime, 10, 20); // dari waktu registrasi
    task_id_4 = getTaskTime(4, task_id_3, 30, 40); // dari waktu task_id_3
    task_id_5 = getTaskTime(5, task_id_4, 3, 8); // dari waktu task_id_4
    task_id_6 = getTaskTime(6, task_id_5, 3, 6); // dari waktu task_id_5
    task_id_7 = getTaskTime(7, task_id_6, 3, 6); // dari waktu task_id_6

    // update data khanza
    await insertTaskId(
      visit_id,
      task_id_3,
      task_id_4,
      task_id_5,
      task_id_6,
      task_id_7,
    );

    // fetch new data pasien
    const patientRegistrationUpdated = await fetchRegistrationByNoReg(visit_id);

    return res.json({
      success: true,
      data: {
        patientRegistrationUpdated,
        pendaftaranAntrean,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data pendaftaran antrean",
      error: (error as Error).message,
    });
  }
});

/**
 * Endpoint untuk memangkas 3 proses (auto repair, validasi ulang, kirim ulang) menjadi 1 endpoint
 * Proses: 
 * 1. Auto repair - generate task_id yang missing
 * 2. Validasi ulang - reprocess data dari Khanza
 * 3. Kirim ulang - resend tasks ke BPJS
 * 
 * Params: startDate dan endDate (format: YYYY-MM-DD)
 */
router.post("/bulk-repair", async (req: Request, res: Response) => {
  const { startDate, endDate } = req.body as { startDate: string; endDate: string };

  // Validasi parameter
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Parameter startDate dan endDate diperlukan",
    });
  }

  // Validasi format tanggal
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Format tanggal tidak valid. Gunakan format YYYY-MM-DD",
    });
  }

  if (start > end) {
    return res.status(400).json({
      success: false,
      message: "startDate tidak boleh lebih besar dari endDate",
    });
  }

  try {
    console.log(`[BULK-REPAIR] Memulai proses repair untuk range: ${startDate} sampai ${endDate}`);

    // Ambil semua visit event dalam range tanggal
    const visitEvents = await prisma.visitEvent.findMany({
      where: {
        tanggal: {
          gte: start,
          lte: end,
        },
      },
      include: {
        EventTasks: true,
      },
      orderBy: {
        tanggal: 'asc',
      },
    });

    console.log(`[BULK-REPAIR] Ditemukan ${visitEvents.length} visit event untuk diproses`);

    const results = [];
    let successCount = 0;
    let failedCount = 0;

    // Proses setiap visit event
    for (const visitEvent of visitEvents) {
      const visitId = visitEvent.visit_id;
      
      try {
        console.log(`[BULK-REPAIR] Memproses visit_id: ${visitId}`);
        
        // STEP 1: Auto Repair - Generate task_id yang missing
        console.log(`[BULK-REPAIR] Step 1: Auto repair untuk ${visitId}`);
        
        // Cek task_id yang ada
        const existingTaskIds = visitEvent.EventTasks.map(task => task.task_id);
        const requiredTaskIds = [0, 3, 4, 5, 6, 7]; // Task yang seharusnya ada
        const missingTaskIds = requiredTaskIds.filter(id => !existingTaskIds.includes(id));
        
        if (missingTaskIds.length > 0) {
          console.log(`[BULK-REPAIR] Missing task_ids untuk ${visitId}:`, missingTaskIds);
          
          // Ambil data dari Khanza untuk generate task yang missing
          const patientRegistration = await fetchRegistrationByNoReg(visitId);
          
          if (patientRegistration) {
            // Generate task_id yang missing menggunakan logic yang sama dengan autorepair
            const registrationDate = new Date(patientRegistration.tgl_registrasi || "");
            const [hours, minutes, seconds] = (patientRegistration.jam_registrasi || "00:00:00").split(":");
            
            const registrationDateTime = new Date(registrationDate);
            registrationDateTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));

            // Ambil data dari BPJS untuk referensi waktu
            let pendaftaranAntrean: any[] = [];
            try {
              pendaftaranAntrean = await getListTaskByKodebooking(visitId);
              if (!Array.isArray(pendaftaranAntrean)) {
                pendaftaranAntrean = [];
              }
            } catch (error) {
              pendaftaranAntrean = [];
            }

            // Helper untuk generate task time
            const getTaskTime = (
              taskId: number,
              baseTime: Date,
              minDelay: number,
              maxDelay: number,
            ): Date => {
              const bpjsTask = pendaftaranAntrean.find((p) => p?.taskid === taskId);
              
              if (bpjsTask && typeof bpjsTask.wakturs === "string" && bpjsTask.wakturs.trim().length > 0) {
                const parsedDate = parseBPJSDateTime(bpjsTask.wakturs);
                if (parsedDate) {
                  return parsedDate;
                }
              }
              
              // Fallback: generate otomatis
              return generateTaskTime(visitId, baseTime, minDelay, maxDelay);
            };

            // Generate task yang missing
            let task_id_3: Date, task_id_4: Date, task_id_5: Date, task_id_6: Date, task_id_7: Date | undefined;
            
            if (missingTaskIds.includes(3)) task_id_3 = getTaskTime(3, registrationDateTime, 10, 20);
            if (missingTaskIds.includes(4)) task_id_4 = getTaskTime(4, task_id_3!, 30, 40);
            if (missingTaskIds.includes(5)) task_id_5 = getTaskTime(5, task_id_4!, 3, 8);
            if (missingTaskIds.includes(6)) task_id_6 = getTaskTime(6, task_id_5!, 3, 6);
            if (missingTaskIds.includes(7)) task_id_7 = getTaskTime(7, task_id_6!, 3, 6);

            // Update ke Khanza
            await insertTaskId(
              visitId,
              task_id_3!,
              task_id_4!,
              task_id_5!,
              task_id_6!,
              task_id_7,
            );
            
            console.log(`[BULK-REPAIR] Task missing berhasil digenerate untuk ${visitId}`);
          }
        } else {
          console.log(`[BULK-REPAIR] Semua task_id sudah lengkap untuk ${visitId}`);
        }

        // STEP 2: Validasi Ulang - Reprocess data dari Khanza
        console.log(`[BULK-REPAIR] Step 2: Validasi ulang untuk ${visitId}`);
        
        // Fetch fresh data dari Khanza
        const khanzaRow = await fetchRegistrationByNoReg(visitId);
        if (!khanzaRow) {
          throw new Error(`Registration dengan no_reg ${visitId} tidak ditemukan di Khanza`);
        }

        // Delete existing VisitEvent dan tasks
        const existingEvent = await prisma.visitEvent.findUnique({
          where: { visit_id: visitId },
        });

        if (existingEvent) {
          await prisma.visitEvent.delete({ where: { visit_id: visitId } });
          console.log(`[BULK-REPAIR] VisitEvent lama dihapus: ${visitId}`);
        }

        // Reprocess row sebagai data baru
        const taskProgress = await checkTaskId(khanzaRow);
        await processRegistrationRow(khanzaRow, taskProgress);
        console.log(`[BULK-REPAIR] Validasi ulang berhasil untuk ${visitId}`);

        // STEP 3: Kirim Ulang - Resend tasks ke BPJS
        console.log(`[BULK-REPAIR] Step 3: Kirim ulang untuk ${visitId}`);
        
        // Fetch visit event yang baru dibuat
        const newVisitEvent = await prisma.visitEvent.findUnique({
          where: { visit_id: visitId },
          include: {
            EventTasks: {
              orderBy: { task_id: "asc" },
            },
          },
        });

        if (!newVisitEvent) {
          throw new Error(`VisitEvent baru tidak ditemukan untuk ${visitId}`);
        }

        // Process tasks secara sequential
        for (const task of newVisitEvent.EventTasks) {
          const currentVisitEvent = await prisma.visitEvent.findUnique({
            where: { id: newVisitEvent.id },
            include: { EventTasks: true },
          });

          if (!currentVisitEvent) continue;

          const currentTask = currentVisitEvent.EventTasks.find(
            (t) => t.id === task.id,
          );
          if (!currentTask) continue;

          const taskWithContext = {
            ...currentTask,
            VisitEvent: currentVisitEvent,
          };

          if (currentTask.task_id === 0) {
            await processRegistrationTask(taskWithContext, true); // force = true
          } else if ([3, 4, 5, 6, 7].includes(currentTask.task_id)) {
            await processUpdateTask(taskWithContext, true); // force = true
          }
        }
        
        console.log(`[BULK-REPAIR] Kirim ulang berhasil untuk ${visitId}`);

        // Ambil status akhir
        const finalEvent = await prisma.visitEvent.findUnique({
          where: { visit_id: visitId },
          include: { EventTasks: true },
        });

        results.push({
          visit_id: visitId,
          status: 'success',
          message: 'Auto repair + validasi ulang + kirim ulang berhasil',
          data: finalEvent,
        });
        
        successCount++;
        
      } catch (error) {
        console.error(`[BULK-REPAIR] Gagal memproses ${visitId}:`, error);
        
        results.push({
          visit_id: visitId,
          status: 'failed',
          message: (error as Error).message,
          error: (error as Error).message,
        });
        
        failedCount++;
      }
    }

    console.log(`[BULK-REPAIR] Proses selesai. Success: ${successCount}, Failed: ${failedCount}`);

    return res.json({
      success: true,
      message: `Bulk repair selesai. Success: ${successCount}, Failed: ${failedCount}`,
      data: {
        totalProcessed: visitEvents.length,
        successCount,
        failedCount,
        results,
      },
    });

  } catch (error) {
    console.error('[BULK-REPAIR] Error utama:', error);
    return res.status(500).json({
      success: false,
      message: "Gagal melakukan bulk repair",
      error: (error as Error).message,
    });
  }
});

export default router;
