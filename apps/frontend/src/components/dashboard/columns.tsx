import { type ColumnDef } from '@tanstack/react-table'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'status',
    accessorFn: (row) => row.status,
    header: 'Status',
  },
  {
    accessorKey: 'email',
    accessorFn: (row) => row.email,
    header: 'Email',
  },
  {
    accessorKey: 'amount',
    accessorFn: (row) => row.amount,
    header: 'Amount',
  },
]
