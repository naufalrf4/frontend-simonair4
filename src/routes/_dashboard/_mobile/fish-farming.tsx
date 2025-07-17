import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/_mobile/fish-farming')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/_mobile/fish-farming"!</div>
}
