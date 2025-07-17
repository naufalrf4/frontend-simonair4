import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/manage-devices')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/manage-devices"!</div>
}
