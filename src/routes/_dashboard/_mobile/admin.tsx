import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/_mobile/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/_mobile/admin"!</div>
}
