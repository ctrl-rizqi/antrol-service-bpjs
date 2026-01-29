import prisma from "../lib/prisma";
import { getJadwalDokter } from "../bpjs/bpjs.client";
import { JadwalDokterResponse } from "../types/bpjs";
import { AggregatedJadwal } from "../validator/aggregated-validator";

async function getOrFetchSchedule(
  kd_dokter: number,
  kd_poli: string,
  tanggal: string,
) {
  // Cek apakah jadwal sudah ada di snapshot
  const existing = await prisma.doctorScheduleQuota.findFirst({
    where: {
      dokter_id: kd_dokter,
      poli_id: kd_poli,
      tanggal: new Date(tanggal),
    },
  });

  if (existing) {
    return existing;
  }

  // debug
  console.log(
    `Jadwal dokter ${kd_dokter} tidak ditemukan di snapshot untuk poli ${kd_poli} pada tanggal ${tanggal}, fetching from BPJS...`,
  );

  // Fetch dari BPJS jika belum ada
  const jadwalResponse: JadwalDokterResponse[] = await getJadwalDokter(
    kd_poli,
    tanggal,
  );

  const jadwal = jadwalResponse.find((j) => j.kodedokter === Number(kd_dokter));

  if (!jadwal) {
    throw new Error(
      `Jadwal dokter ${kd_dokter} tidak ditemukan di BPJS untuk poli ${kd_poli}`,
    );
  }

  // Simpan ke database
  const [jam_mulai, jam_selesai] = jadwal.jadwal.split("-");

  return prisma.doctorScheduleQuota.create({
    data: {
      dokter_id: kd_dokter,
      nama_dokter: jadwal.namadokter,
      poli_id: kd_poli,
      nama_poli: jadwal.namapoli,
      tanggal: new Date(tanggal),
      kuota_jkn: jadwal.kapasitaspasien,
      jam_mulai: jam_mulai.trim(),
      jam_selesai: jam_selesai.trim(),
      source: "AUTO_AGGREGATOR",
      fetchedAt: new Date(),
    },
  });
}

export async function aggregatorJadwal(
  kd_dokter: number,
  kd_poli: string,
  tanggal: string,
  jam: string,
): Promise<AggregatedJadwal> {
  const schedule = await getOrFetchSchedule(
    parseInt(kd_dokter.toString()),
    kd_poli,
    tanggal,
  );

  const { estimasiDilayani, sisaKuota, totalRegistrasi } =
    await calculateSisaKuota(
      kd_dokter,
      kd_poli,
      tanggal,
      jam,
      schedule.kuota_jkn,
    );

  return {
    nomorantrean: totalRegistrasi + 1,
    kodedokter: Number(schedule.dokter_id),
    namadokter: schedule.nama_dokter,
    kodepoli: schedule.poli_id,
    namapoli: schedule.nama_poli,
    jampraktek: schedule.jam_mulai + "-" + schedule.jam_selesai,
    kuotajkn: schedule.kuota_jkn,
    sisakuotajkn: sisaKuota,
    kuotanonjkn: schedule.kuota_jkn,
    sisakuotanonjkn: sisaKuota,
    estimasidilayani: estimasiDilayani.getTime(),
  };
}

export async function calculateSisaKuota(
  kd_dokter: number,
  kd_poli: string,
  tanggal: string,
  jam: string,
  kuotajkn: number,
): Promise<{
  sisaKuota: number;
  estimasiDilayani: Date;
  totalRegistrasi: number;
}> {
  // Kalkulasi sisa kuota: kuota_jkn - total registrasi di tanggal yang sama
  const totalRegistrasi = await prisma.visitEvent.count({
    where: {
      dokter_id: parseInt(kd_dokter.toString()),
      poli_id: kd_poli,
      tanggal: new Date(tanggal),
    },
  });

  const sisaKuota = Math.max(0, kuotajkn - totalRegistrasi);

  // Estimasi dilayani: jam kedatangan + (total registrasi * 6 menit)
  // Fix: Gunakan format ISO dengan timezone +07:00 agar waktu yang dihasilkan sesuai dengan WIB
  const estimasiDilayani = new Date(
    new Date(`${tanggal}T${jam.trim()}+07:00`).getTime() +
      totalRegistrasi * 6 * 60000,
  );

  return {
    totalRegistrasi,
    sisaKuota,
    estimasiDilayani,
  };
}
