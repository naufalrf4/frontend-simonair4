import { apiClient } from '@/utils/apiClient';
import type { User } from '../types';

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin' | 'superuser';
  email_verified?: boolean | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function mapApiUser(u: any): User {
  // Map snake_case API to camelCase UI type
  return {
    id: u.id,
    email: u.email,
    fullName: u.full_name ?? u.fullName ?? u.name ?? '',
    role: u.role,
    emailVerified: Boolean(u.email_verified ?? u.emailVerified),
    isActive: u.is_active ?? u.isActive ?? true,
    createdAt: u.created_at ?? u.createdAt ?? new Date().toISOString(),
    updatedAt: u.updated_at ?? u.updatedAt ?? new Date().toISOString(),
    lastLogin: u.last_login ?? u.lastLogin ?? null,
  } as User;
}

export class UsersService {
  static async list(params: UserListParams = {}): Promise<UserListResponse> {
    const { page = 1, limit = 10, search, role, email_verified, sortBy, sortOrder } = params;
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) query.set('search', search);
    if (role) query.set('role', role);
    if (email_verified !== undefined) query.set('email_verified', String(email_verified));
    if (sortBy) query.set('sortBy', sortBy);
    if (sortOrder) query.set('sortOrder', sortOrder);

    const res = await apiClient.get(`/users?${query.toString()}`);
    const raw = res.data;

    // Support both enveloped and non-enveloped shapes just in case
    const usersRaw = raw?.data?.users ?? raw?.data ?? raw?.users ?? [];
    const paginationRaw = raw?.pagination ?? raw?.metadata?.pagination ?? undefined;

    const users = Array.isArray(usersRaw) ? usersRaw.map(mapApiUser) : [];
    const total = paginationRaw?.total ?? users.length;
    const pageNum = paginationRaw?.page ?? page;
    const lim = paginationRaw?.limit ?? limit;

    return {
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: lim,
        totalPages: Math.max(1, Math.ceil(total / lim)),
      },
    };
  }

  static async getById(id: string): Promise<User> {
    const res = await apiClient.get(`/users/${id}`);
    const raw = res.data;
    const userRaw = raw?.data ?? raw;
    return mapApiUser(userRaw);
  }

  static async create(data: {
    email: string;
    password: string;
    fullName: string;
    role: 'user' | 'admin' | 'superuser';
    emailVerified?: boolean;
  }): Promise<User> {
    const payload = {
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      role: data.role,
      email_verified: data.emailVerified ?? false,
    };
    const res = await apiClient.post('/users', payload);
    const raw = res.data;
    const userRaw = raw?.data ?? raw;
    return mapApiUser(userRaw);
  }

  static async update(
    id: string,
    data: Partial<{
      fullName: string;
      role: 'user' | 'admin' | 'superuser';
      emailVerified: boolean;
      isActive: boolean;
    }>,
  ): Promise<User> {
    const payload: Record<string, any> = {};
    if (data.fullName !== undefined) payload.full_name = data.fullName;
    if (data.role !== undefined) payload.role = data.role;
    if (data.emailVerified !== undefined) payload.email_verified = data.emailVerified;
    if (data.isActive !== undefined) payload.is_active = data.isActive;

    const res = await apiClient.patch(`/users/${id}`, payload);
    const raw = res.data;
    const userRaw = raw?.data ?? raw;
    return mapApiUser(userRaw);
  }

  static async delete(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete(`/users/${id}`);
    const raw = res.data;
    const msg = raw?.data?.message ?? raw?.message ?? 'User deleted successfully';
    return { message: msg };
  }
}

export const userKeys = {
  all: ['users'] as const,
  list: (params: UserListParams) => ['users', params] as const,
  detail: (id: string) => ['users', id] as const,
};

