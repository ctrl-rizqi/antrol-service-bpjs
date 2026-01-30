import { type ColumnDef } from '@tanstack/react-table'
import type { PoliException } from '@/interface/poli-exception'
import { Badge } from '../ui/badge'

export const columns: ColumnDef<PoliException, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'poli_id',
    header: 'Kode Poli',
    cell: ({ row }) => {
      const kd_poli = row.original.poli_id
      return <Badge variant="outline">{kd_poli}</Badge>
    },
  },
  {
    accessorKey: 'nama_poli',
    header: 'Nama Poli',
  },
]
