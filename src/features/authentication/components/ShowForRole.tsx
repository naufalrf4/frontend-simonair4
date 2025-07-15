import { useAuth } from '@/features/authentication/context/AuthContext';
import { type UserRole } from '../types';

type ShowForRoleProps = {
  roles: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const ShowForRole = ({ roles, children, fallback = null }: ShowForRoleProps) => {
  const { hasRole } = useAuth();

  const allowed = hasRole(roles);

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
};
