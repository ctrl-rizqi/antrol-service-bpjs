import { Router } from "express";
import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { paginate } from "../utils/pagination";
import { getPendaftaranAntreanByTanggal } from "../bpjs/bpjs.client";
import { formatToYYYYMMDD } from "../utils/formatDate";
import { fetchRegistrationByNoReg, insertTaskId } from "../khanza/khanza.query";
import { generateTaskTime } from "../utils/generateTime";

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
      data: snapshot,
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

    task_id_3 = generateTaskTime(visit_id, registrationDateTime, 10, 20); // dari waktu registrasi
    task_id_4 = generateTaskTime(visit_id, task_id_3, 30, 40); // dari waktu task_id_3
    task_id_5 = generateTaskTime(visit_id, task_id_4, 3, 8); // dari waktu task_id_4
    task_id_6 = generateTaskTime(visit_id, task_id_5, 3, 6); // dari waktu task_id_5
    task_id_7 = generateTaskTime(visit_id, task_id_6, 3, 6); // dari waktu task_id_6

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
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data task_id_4",
      error: (error as Error).message,
    });
  }
});

export default router;
