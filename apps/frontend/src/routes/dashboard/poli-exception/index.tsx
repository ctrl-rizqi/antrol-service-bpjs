import { useState } from 'react'
import { DataTable } from '@/components/data-table'
import Header from '@/components/Header'
import { createFileRoute } from '@tanstack/react-router'
import { columns } from '@/components/poli-exception/columns'
import {
  usePoli,
  usePoliException,
  usePoliExceptionSubmit,
} from '@/hooks/poli-exception'
import type { PoliException } from '@/interface/poli-exception'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@/components/ui/multi-select'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/poli-exception/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [open, setOpen] = useState<boolean>(false)
  const [selectedPolis, setSelectedPolis] = useState<string[]>([])
  const { data } = usePoliException()
  const { data: poliData } = usePoli()
  const { mutateAsync, isPending } = usePoliExceptionSubmit()

  // format poli, jangan tampilkan poliData jika data (poliException) ada
  const existingPoliIds = new Set(
    (data?.data || []).map((item: PoliException) => item.poli_id),
  )
  const filteredPoliData = (poliData?.data || []).filter(
    (poli: any) => !existingPoliIds.has(poli.kodepoli),
  )

  // handleSubmit
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await mutateAsync({
        poli_id: selectedPolis.map((poli_id) => ({
          poli_id,
          poli_nama:
            filteredPoliData.find((poli: any) => poli.kodepoli === poli_id)
              ?.namapoli ?? '',
        })),
      })
      toast.success('Berhasil menambahkan pengecualian poli')
      setOpen(false)
      setSelectedPolis([])
    } catch (error) {
      toast.error('Gagal menambahkan pengecualian poli')
    }
  }

  return (
    <>
      <Header
        breadcrumb={[
          {
            title: 'Daftar pengecualian Poli',
            url: '/dashboard/poli-exception',
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <Button onClick={() => setOpen(true)}>Tambah</Button>
        </div>
        <DataTable
          columns={columns}
          data={(data?.data || []) as PoliException[]}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Tambah pengecualian Poli</DialogTitle>
          <DialogDescription>...</DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4">
            <MultiSelect
              values={selectedPolis}
              onValuesChange={setSelectedPolis}
            >
              <MultiSelectTrigger className="w-full">
                <MultiSelectValue placeholder="Select Poli" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  {filteredPoliData.map((poli: any, i: number) => (
                    <MultiSelectItem key={i} value={poli.kodepoli}>
                      {poli.kodepoli} - {poli.namapoli}
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
