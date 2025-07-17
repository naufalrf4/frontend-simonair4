import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/fish-mortality')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/fish-mortality"!</div>
}
