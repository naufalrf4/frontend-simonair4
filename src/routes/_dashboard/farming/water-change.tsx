import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '@/features/authentication/components/RouteGuard'
import { WaterChangesPage } from '@/features/water-changes/components/WaterChangesPage'

export const Route = createFileRoute('/_dashboard/farming/water-change')({
  component: () => (
    <RouteGuard protected allowedRoles={["superuser", "admin", "user"]}>
      <WaterChangesPage />
    </RouteGuard>
  ),
})
