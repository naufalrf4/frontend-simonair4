export type UserRole = 'superuser' | 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  fullName: string;
  name: string;
  role: UserRole;
  user_type: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}