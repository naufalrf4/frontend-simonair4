import { RouteGuard } from '@/features/authentication/components/RouteGuard';
import { DashboardLayout } from '@/features/dashboard/components/layout/DashboardLayout';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard')({
  component: () => (
    <RouteGuard protected redirectTo="/login">
      {/* HALAMAND DASHBOARD */}
      <DashboardLayout />
    </RouteGuard>
  ),
});
