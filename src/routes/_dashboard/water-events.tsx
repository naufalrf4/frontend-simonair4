import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/water-events')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/water-events"!</div>
}
