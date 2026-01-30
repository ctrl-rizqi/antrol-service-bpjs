import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/visit-event/view')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/visit-event/view"!</div>
}
