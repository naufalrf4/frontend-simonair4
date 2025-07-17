import BottomNav from '@/components/common/bottom-nav';
import Navbar from '@/components/common/navbar';
import Sidebar from '@/components/common/sidebar';
import { Outlet } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';

export function DashboardLayout() {
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
