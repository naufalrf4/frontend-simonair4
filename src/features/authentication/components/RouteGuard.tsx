import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '@/features/users/types';

interface RouteGuardProps {
  children: React.ReactNode;
  protected?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export function RouteGuard({ 
  children, 
  protected: isProtected = false,
  allowedRoles = [],
  redirectTo,
  fallback = <div>Loading...</div>,
  onUnauthorized
}: RouteGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <>{fallback}</>;
  }
  
  if (isProtected && !isAuthenticated) {
    return <Navigate to={redirectTo || "/login"} />;
  }
  
  if (isProtected && isAuthenticated && allowedRoles.length > 0) {
    const userRole = user?.role as UserRole;
    if (!userRole || !allowedRoles.includes(userRole)) {
      if (onUnauthorized) {
        onUnauthorized();
      }
      return <Navigate to="/unauthorized" />;
    }
  }
  
  if (!isProtected && isAuthenticated) {
    return <Navigate to={redirectTo || "/dashboard"} />;
  }
  
  return <>{children}</>;
}