import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/_mobile/device')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/_mobile/devices"!</div>
}
