import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '@/features/authentication/components/RouteGuard';
import { UsersPage } from '@/features/users/components/UsersPage';

export const Route = createFileRoute('/_dashboard/admin/users')({
  component: () => (
    <RouteGuard protected allowedRoles={["superuser"]} redirectTo="/unauthorized">
      <UsersPage />
    </RouteGuard>
  ),
})
