import { useAuth } from '../context/AuthContext';
import { type UserRole } from '../types';
import { Navigate } from '@tanstack/react-router';

type ProtectedRouteProps = {
  roles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const ProtectedRoute = ({ roles, children, fallback }: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
