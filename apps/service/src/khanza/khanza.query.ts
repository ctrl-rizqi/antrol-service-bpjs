import { khanzaRegistration } from "../types/khanza";
import { khanzaDb } from "./khanza.client";

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
    AND (rp.tgl_registrasi > ? OR (rp.tgl_registrasi = ? AND rp.jam_reg > ?))
    AND rp.jenis_kunjungan IS NOT NULL
    ORDER BY
      rp.tgl_registrasi,
      rp.jam_reg
    LIMIT 50
    `,
    [lastDate, lastDate, lastTime],
  );

  return rows as Array<khanzaRegistration>;
}

export async function fetchRegistrationByNoReg(
  noReg: string,
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
    WHERE rp.no_reg = ?
    `,
    [noReg],
  );

  const registrationRows = rows as Array<khanzaRegistration>;
  return registrationRows.length > 0 ? registrationRows[0] : null;
}
