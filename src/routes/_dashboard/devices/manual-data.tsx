import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/devices/manual-data')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/manual-data"!</div>
}
