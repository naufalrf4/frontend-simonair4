import { createFileRoute, redirect } from '@tanstack/react-router';
import type { AuthContextType } from '@/features/authentication/types';

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const auth = context.auth as AuthContextType;

    if (auth.isAuthenticated) {
      throw redirect({
        to: '/dashboard',
        replace: true,
      });
    }

    if (!auth.isLoading && !auth.user) {
      throw redirect({
        to: '/login',
        replace: true,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (auth.isAuthenticated) {
      throw redirect({ to: '/dashboard', replace: true });
    } else {
      throw redirect({ to: '/login', replace: true });
    }
  },
});
