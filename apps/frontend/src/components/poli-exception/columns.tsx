import { type ColumnDef } from '@tanstack/react-table'
import type { PoliException } from '@/interface/poli-exception'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { usePoliExceptionDelete } from '@/hooks/poli-exception'

// hapus
const DeleteBtn = ({ id }: { id: string }) => {
  // handle hapus
  const { mutateAsync, isPending } = usePoliExceptionDelete()

  const handleDelete = async () => {
    try {
      await mutateAsync(id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleDelete}
      disabled={isPending}
    >
      Hapus
    </Button>
  )
}

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
  {
    header: 'Aksi',
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <div className="flex gap-2">
          <DeleteBtn id={id} />
        </div>
      )
    },
  },
]
