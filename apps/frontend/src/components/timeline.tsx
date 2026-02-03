import type { EventTask, VisitEventLog } from '@/interface/visit-event'

export interface TimelineProps extends EventTask {
  logs: VisitEventLog[]
}

const titleFormat = (task_id: number) => {
  switch (task_id) {
    case 0:
      return 'Registrasi'
    case 1:
      return 'Pengambilan Tiket'
    case 2:
      return 'Pasien Masuk'
    case 3:
      return 'Task ID 3 - Administrasi'
    case 4:
      return 'Task ID 4 - Masuk Poli'
    case 5:
      return 'Task ID 5 - Periksa'
    case 6:
      return 'Task ID 6 - Selesai'
    case 7:
      return 'Task ID 7 - Pasien Keluar'
    case 99:
      return 'Dibatalkan'
    default:
      return 'Registrasi'
  }
}

const colorBadge = (status: string) => {
  switch (status) {
    case 'SEND':
      return 'bg-green-500 text-white'
    case 'DONE':
      return 'bg-yellow-500 text-white'
    case 'FAILED':
      return 'bg-red-500 text-white'
    default:
      return 'bg-default'
  }
}

const formatToWIB = (date: string | Date) => {
  if (!date) return '-'
  return (
    new Date(date).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB'
  )
}

export function Timeline({ event }: { event: TimelineProps }) {
  const { id, task_id, status, original_event_time, event_time } = event
  return (
    <div key={id} className="flex gap-6">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-foreground rounded-full" />
        <div className="w-0.5 h-10 bg-border my-2" />
      </div>
      <div className="pt-0.5 pb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-foreground">
            {titleFormat(task_id)}
          </p>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full border ${colorBadge(
              status,
            )}`}
          >
            {status}
          </span>

          {original_event_time && (
            <>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full border `}
              >
                Waktu Original
              </span>
              <span className="text-sm font-semibold text-primary">
                {formatToWIB(original_event_time || '')}
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatToWIB(event_time || '')}
        </p>
        {event.logs.length > 0 && (
          <div className="mt-2">
            {event.logs.map((log) => (
              <p key={log.id} className="text-xs text-muted-foreground">
                {log.last_error}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
