export type NoContentResponse = {
  metadata: {
    code: 201;
    message: "No Content";
  };
};

export type JadwalDokterResponse = {
  kodesubspesialis: string;
  hari: number;
  kapasitaspasien: number;
  libur: number;
  namahari: string;
  jadwal: string; //Contoh: 15:00-17:00
  namasubspesialis: string;
  namadokter: string;
  kodepoli: string;
  namapoli: string;
  kodedokter: number;
};
