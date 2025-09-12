import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '@/features/authentication/components/RouteGuard';
import { GrowthPage } from '@/features/growth/components/GrowthPage';

export const Route = createFileRoute('/_dashboard/farming/fish-growth')({
  component: () => (
    <RouteGuard protected allowedRoles={["superuser", "admin", "user"]} redirectTo="/unauthorized">
      <GrowthPage />
    </RouteGuard>
  ),
})

