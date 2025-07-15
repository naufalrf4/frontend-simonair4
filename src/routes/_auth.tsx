import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthLoading } from '@/components/feedback/AuthLoading';
import { ErrorPage } from '@/components/common/error-page';

import type { AuthContextType } from '@/features/authentication/types';
import AuthLayout from '@/features/authentication/components/layout/AuthLayout';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    const auth = context.auth as AuthContextType;

    const maxWait = 3000;
    const startTime = Date.now();

    while (auth.isLoading) {
      if (Date.now() - startTime > maxWait) break;
      await new Promise((r) => setTimeout(r, 50));
    }

    if (auth.isAuthenticated) {
      throw redirect({ to: '/dashboard', replace: true });
    }

    return;
  },

  component: AuthLayout,
  pendingComponent: AuthLoading,
  pendingMs: 1000,
  pendingMinMs: 500,
  errorComponent: ({ error }) => <ErrorPage error={error} />,
});