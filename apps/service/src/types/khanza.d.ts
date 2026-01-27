export type khanzaRegistration = {
  no_reg: string;
  no_rawat: string;
  tgl_registrasi: string;
  jam_registrasi: string;
  nama_hari: string;
  jam_reg: string;
  kd_dokter: number;
  nama_dokter: string;
  no_rkm_medis: string;
  kd_poli: string;
  nama_poli: string;
  type_patient: string;
  jenis_kunjungan: string;
  pasien_baru: "Lama" | "Baru";
  jam_mulai: string;
  jam_selesai: string;
  kuota_jkn: number;
  task_id_3: string;
  task_id_4: string;
  task_id_5: string;
  task_id_6: string;
  task_id_7: string;
};

export type QuotaInfo = {
  poli_id: string;
  poli_name: string;
  dokter_id: string;
  dokter_name: string;
  tanggal: string;
  jam_praktek: string;
  kuota_jkn: number;
  total_registrasi: number;
  sisa_kuota_jkn: number;
  kuota_nonjkn: number;
  sisa_kuota_nonjkn: number;
};
