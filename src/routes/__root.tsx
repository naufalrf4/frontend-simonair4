// src/routes/__root.tsx
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/common/not-found-page";
import { AppProvider } from "@/utils/AppProvider";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">An Error Occurred</h1>
        <p className="text-gray-700 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to Home
        </button>
      </div>
    </div>
  ),
  pendingComponent: () => <div>Loading...</div>,
});

function RootComponent() {
  return (
    <>
      <AppProvider>
        <Outlet />
      </AppProvider>
    </>
  );
}
