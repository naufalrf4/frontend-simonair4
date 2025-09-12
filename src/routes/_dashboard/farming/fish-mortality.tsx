import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '@/features/authentication/components/RouteGuard'
import { MortalityPage } from '@/features/fish-mortality/components/MortalityPage'

export const Route = createFileRoute('/_dashboard/farming/fish-mortality')({
  component: () => (
    <RouteGuard protected allowedRoles={["superuser", "admin", "user"]}>
      <MortalityPage />
    </RouteGuard>
  ),
})

