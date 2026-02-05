import type { EventTask } from '@/interface/visit-event'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '../ui/popover'
import { Fragment } from 'react/jsx-runtime'

interface PayloadTimelineProps {
  payload: EventTask[]
}

export default function PayloadTimeline({ payload }: PayloadTimelineProps) {
  return (
    <>
      <div className="flex flex-row gap-3">
        {payload.map((item) => (
          <PopoverTask key={item.id} payload={item} />
        ))}
      </div>
    </>
  )
}

function PopoverTask({ payload }: { payload: EventTask }) {
  const statusColors = (item: EventTask) => {
    switch (item.status) {
      case 'SEND':
        return "bg-green-500 shadow-[0_0_10px_theme('colors.green.500')]"
      case 'DONE':
        return "bg-yellow-500 shadow-[0_0_10px_theme('colors.yellow.500')]"
      case 'FAILED':
        return "bg-red-500 shadow-[0_0_10px_theme('colors.red.500')]"
      default:
        return 'bg-default-500 shadow-[0_0_10px_theme("colors.default.500")]'
    }
  }

  return (
    <Fragment key={payload.id}>
      <Popover>
        <PopoverTrigger>
          <div className={cn('w-2 h-2 rounded-full', statusColors(payload))} />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>Task ID : {payload.task_id}</PopoverHeader>
          <PopoverHeader>Status : {payload.status}</PopoverHeader>
        </PopoverContent>
      </Popover>
    </Fragment>
  )
}
