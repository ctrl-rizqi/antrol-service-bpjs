import type { ColumnDef } from '@tanstack/react-table'
import type { TaskIdRegistration } from '@/interface/visit-event'

export const columns: ColumnDef<TaskIdRegistration>[] = [
  {
    accessorKey: 'visit_id',
    header: 'Kode Booking',
  },
  {
    accessorKey: 'tanggal',
    header: 'Tanggal',
  },
  {
    accessorKey: 'status_kunjungan',
    header: 'Status Kunjungan',
    cell: (info) => {
      if (info.row.original.status_kunjungan) {
        return 'Selesai'
      } else {
        return 'Belum Selesai'
      }
    },
  },
  {
    accessorKey: 'status_peserta',
    header: 'Status Peserta',
    cell: (info) => {
      if (info.row.original.status_peserta) {
        return 'Ya'
      } else {
        return 'Tidak'
      }
    },
  },
  {
    accessorKey: 'kodedokter',
    header: 'Kode Dokter',
  },
]
