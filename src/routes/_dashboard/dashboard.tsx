import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_dashboard/dashboard')({
  component: RouteComponent,
});
import UserDashboard from '@/features/dashboard/components/UserDashboard';

function RouteComponent() {
  return (
    <UserDashboard />
  );
}