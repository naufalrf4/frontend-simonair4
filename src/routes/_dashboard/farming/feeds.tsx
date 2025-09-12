import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '@/features/authentication/components/RouteGuard';
import { FeedsPage } from '@/features/feeds/components/FeedsPage';

export const Route = createFileRoute('/_dashboard/farming/feeds')({
  component: () => (
    <RouteGuard protected allowedRoles={["superuser", "admin", "user"]}>
      <FeedsPage />
    </RouteGuard>
  ),
})
