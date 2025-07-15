import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { routeTree } from './routeTree.gen';

import { NotFoundPage } from './components/common/not-found-page';
import { ErrorPage } from './components/common/error-page';
import './styles.css';
import { AuthProvider, useAuth } from './features/authentication/context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient,
  },
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: ({ error, reset }) => (
    <ErrorPage error={error} reset={reset} />
  ),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const auth = useAuth();
  
  return (
    <RouterProvider router={router} context={{ auth, queryClient }} />
  );
}

function Root() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

const rootElement = document.getElementById('app');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Root />);
}
