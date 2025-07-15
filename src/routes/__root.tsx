// src/routes/__root.tsx (Unchanged, but confirmed for completeness)
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useMediaQuery } from 'react-responsive';

// Define the router context interface
export interface MyRouterContext {
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
  };
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const isMobile = useMediaQuery({ maxWidth: 640 });

  return (
    <>
      <Outlet />
      <Toaster
        position={isMobile ? "top-center" : "bottom-right"}
        richColors
        closeButton
      />
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}
