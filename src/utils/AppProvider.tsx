import { AuthProvider } from '@/features/authentication/context/AuthContext';
import { type ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Toaster } from 'sonner';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const isMobile = useMediaQuery({ maxWidth: 640 });

  return (
    <>
      <AuthProvider>
        {children}
        <Toaster position={isMobile ? 'top-center' : 'bottom-right'} richColors closeButton />
      </AuthProvider>
    </>
  );
};
