import { createFileRoute } from '@tanstack/react-router';
import { AuthLoading } from '@/components/feedback/AuthLoading';
  import { ErrorPage } from '@/components/common/error-page';
  import AuthLayout from '@/features/authentication/components/layout/AuthLayout';
  import { RouteGuard } from '@/features/authentication/components/RouteGuard';

export const Route = createFileRoute('/_auth')({
  component: () => (
    <RouteGuard>
      <AuthLayout />
    </RouteGuard>
  ),
  pendingComponent: AuthLoading,
  errorComponent: ({ error, reset }) => <ErrorPage error={error} reset={reset} />,
});
