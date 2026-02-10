import { khanzaRegistration } from "../types/khanza";
import { khanzaDb } from "./khanza.client";
import { toLocalDateParts } from "../utils/formatDate";

export async function fetchRegistrations(
  lastDate: string,
  lastTime: string,
): Promise<Array<khanzaRegistration>> {
  const [rows] = await khanzaDb.query(
    `
    SELECT
      rp.no_reg,
      rp.no_rawat,
      rp.tgl_registrasi,
      CASE DAYOFWEEK(rp.tgl_registrasi)
        WHEN 1 THEN 'Minggu'
        WHEN 2 THEN 'Senin'
        WHEN 3 THEN 'Selasa'
        WHEN 4 THEN 'Rabu'
        WHEN 5 THEN 'Kamis'
        WHEN 6 THEN 'Jumat'
        WHEN 7 THEN 'Sabtu'
      END as nama_hari,
      rp.jam_reg as jam_registrasi,
      mpd.kd_dokter_bpjs as kd_dokter, 
      mpd.nm_dokter_bpjs as nama_dokter,
      rp.no_rkm_medis,
      mp.kd_poli_bpjs as kd_poli,
      mp.nm_poli_bpjs as nama_poli,
      rp.jenis_kunjungan,
      rp.status_poli as pasien_baru,
      j.jam_mulai,
      j.jam_selesai,
      j.kuota as kuota_jkn,
      rp.task_id_3,
      rp.task_id_4,
      rp.task_id_5,
      rp.task_id_6,
      rp.task_id_7
    FROM reg_periksa rp
    LEFT JOIN maping_dokter_dpjpvclaim mpd ON rp.kd_dokter = mpd.kd_dokter
    LEFT JOIN maping_poli_bpjs mp ON rp.kd_poli = mp.kd_poli_bpjs
    LEFT JOIN jadwal j ON rp.kd_dokter = j.kd_dokter 
      AND rp.kd_poli = j.kd_poli 
      AND CASE DAYOFWEEK(rp.tgl_registrasi)
        WHEN 1 THEN 'MINGGU'
        WHEN 2 THEN 'SENIN'
        WHEN 3 THEN 'SELASA'
        WHEN 4 THEN 'RABU'
        WHEN 5 THEN 'KAMIS'
        WHEN 6 THEN 'JUMAT'
        WHEN 7 THEN 'SABTU'
      END = j.hari_kerja
    WHERE rp.kd_pj = 'BPJ'
    AND rp.tgl_registrasi = ?
    AND rp.jam_reg >= ?
    ORDER BY
      rp.tgl_registrasi,
      rp.jam_reg
    LIMIT 50
    `,
    [lastDate, lastTime],
  );

  return rows as Array<khanzaRegistration>;
}

export async function fetchRegistrationByNoReg(
  noRawat: string,
): Promise<khanzaRegistration | null> {
  const [rows] = await khanzaDb.query(
    `
    SELECT
      rp.no_reg,
      rp.no_rawat,
      rp.tgl_registrasi,
      CASE DAYOFWEEK(rp.tgl_registrasi)
        WHEN 1 THEN 'Minggu'
        WHEN 2 THEN 'Senin'
        WHEN 3 THEN 'Selasa'
        WHEN 4 THEN 'Rabu'
        WHEN 5 THEN 'Kamis'
        WHEN 6 THEN 'Jumat'
        WHEN 7 THEN 'Sabtu'
      END as nama_hari,
      rp.jam_reg as jam_registrasi,
      mpd.kd_dokter_bpjs as kd_dokter, 
      mpd.nm_dokter_bpjs as nama_dokter,
      rp.no_rkm_medis,
      mp.kd_poli_bpjs as kd_poli,
      mp.nm_poli_bpjs as nama_poli,
      rp.jenis_kunjungan,
      rp.status_poli as pasien_baru,
      j.jam_mulai,
      j.jam_selesai,
      j.kuota as kuota_jkn,
      rp.task_id_3,
      rp.task_id_4,
      rp.task_id_5,
      rp.task_id_6,
      rp.task_id_7
    FROM reg_periksa rp
    LEFT JOIN maping_dokter_dpjpvclaim mpd ON rp.kd_dokter = mpd.kd_dokter
    LEFT JOIN maping_poli_bpjs mp ON rp.kd_poli = mp.kd_poli_bpjs
    LEFT JOIN jadwal j ON rp.kd_dokter = j.kd_dokter 
      AND rp.kd_poli = j.kd_poli 
      AND CASE DAYOFWEEK(rp.tgl_registrasi)
        WHEN 1 THEN 'MINGGU'
        WHEN 2 THEN 'SENIN'
        WHEN 3 THEN 'SELASA'
        WHEN 4 THEN 'RABU'
        WHEN 5 THEN 'KAMIS'
        WHEN 6 THEN 'JUMAT'
        WHEN 7 THEN 'SABTU'
      END = j.hari_kerja
    WHERE rp.no_rawat = ?
    `,
    [noRawat],
  );

  const registrationRows = rows as Array<khanzaRegistration>;
  return registrationRows.length > 0 ? registrationRows[0] : null;
}

export async function fetchTaskId3(visit_id: string): Promise<Array<{
  visit_id: string;
  task_id_3_original: string;
  task_id_3_new: string;
}> | null> {
  const [rows] = await khanzaDb.query(
    `
    SELECT mb.no_rawat, mb.dikirim AS jam_mutasi, rp.task_id_3 FROM mutasi_berkas mb LEFT JOIN reg_periksa rp ON mb.no_rawat = rp.no_rawat 
    WHERE mb.no_rawat = ?
    `,
    [visit_id],
  );

  const tasks = rows as Array<{
    no_rawat: string;
    jam_mutasi: string;
    task_id_3: string;
  }>;

  if (tasks.length === 0) return null;

  const formattedTasks = tasks.map((task) => ({
    visit_id: task.no_rawat,
    task_id_3_original: task.jam_mutasi,
    task_id_3_new: task.task_id_3,
  }));

  return formattedTasks;
}

export async function fetchTaskId4(visit_id: string): Promise<Array<{
  visit_id: string;
  task_id_4_original: string;
  task_id_4_new: string;
}> | null> {
  const [rows] = await khanzaDb.query(
    `SELECT pr.no_rawat, pr.tgl_perawatan, pr.jam_rawat, rp.task_id_4 FROM pemeriksaan_ralan pr 
    LEFT JOIN reg_periksa rp ON pr.no_rawat = rp.no_rawat WHERE pr.no_rawat = ?`,
    [visit_id],
  );
  // Output:
  // pr.tgl_perawatan: 2026-02-05T17:00:00.000Z
  // pr.jam_rawat: 18:48:34

  const tasks = rows as Array<{
    no_rawat: string;
    tgl_perawatan: Date;
    jam_rawat: string;
    task_id_4: string;
  }>;

  if (tasks.length === 0) return null;

  const formattedTasks = tasks.map((task) => {
    const { tanggalOnly } = toLocalDateParts(task.tgl_perawatan);
    return {
      visit_id: task.no_rawat,
      task_id_4_original: `${tanggalOnly} ${task.jam_rawat}`,
      task_id_4_new: task.task_id_4,
    };
  });

  return formattedTasks;
}

export async function insertTaskId(
  visit_id: string,
  task_id_3?: Date,
  task_id_4?: Date,
  task_id_5?: Date,
  task_id_6?: Date,
  task_id_7?: Date,
): Promise<void> {
  const query = `
    UPDATE reg_periksa 
    SET task_id_3 = ?, task_id_4 = ? , task_id_5 = ?, task_id_6 = ?, task_id_7 = ?
    WHERE no_rawat = ?
  `;
  await khanzaDb.query(query, [
    task_id_3 || null,
    task_id_4 || null,
    task_id_5 || null,
    task_id_6 || null,
    task_id_7 || null,
    visit_id,
  ]);
}
