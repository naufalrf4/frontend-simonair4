import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/fish-growth')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/fish-growth"!</div>
}
