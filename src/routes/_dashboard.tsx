import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useState, useCallback, useMemo } from 'react';
import Sidebar from '@/components/common/sidebar';
import Navbar from '@/components/common/navbar';
import BottomNav from '@/components/common/bottom-nav';
import { ErrorPage } from '@/components/common/error-page';
import type { AuthContextType } from '@/features/authentication/types';

function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block w-64 h-screen sticky top-0 z-30">
        <div className="animate-pulse bg-card h-full" />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-20 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="h-full bg-muted animate-pulse" />
        </div>
        <div className="flex-1 container mx-auto p-6">
          <div className="space-y-6">
            <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async ({ context, location }) => {
    const auth = context.auth as AuthContextType;

    console.log('Dashboard beforeLoad - Auth State:', {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      user: auth.user,
    });

    if (auth.isAuthenticated) return;

    if (!auth.isLoading && !auth.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
        replace: true,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
        replace: true,
      });
    }
  },

  component: DashboardLayout,
  pendingComponent: DashboardLoading,
  errorComponent: ({ error, reset }) => <ErrorPage error={error} reset={reset} />,
});

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const handleSidebarToggle = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, []);

  const layoutClasses = useMemo(
    () => ({
      sidebar: `hidden lg:block h-screen sticky top-0 z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`,
      mainContent: 'flex-1 flex flex-col min-h-screen transition-all duration-300',
    }),
    [sidebarCollapsed],
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className={layoutClasses.sidebar}>
        <Sidebar
          defaultCollapsed={sidebarCollapsed}
          onCollapsedChange={handleSidebarToggle}
          isInsideSheet={false}
        />
      </aside>

      <div className={layoutClasses.mainContent}>
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-6">
          <Outlet />
        </main>
        <footer className="lg:hidden sticky bottom-0 z-10">
          <BottomNav />
        </footer>
      </div>
    </div>
  );
}
