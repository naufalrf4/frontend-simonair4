import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/sensor-data')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/sensor-data"!</div>
}
