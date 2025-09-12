import { useQuery } from '@tanstack/react-query';
import { UsersService } from '../services/usersService';

export interface BasicUser {
  id: string;
  email?: string;
  name?: string;
  full_name?: string;
  fullName?: string;
}

export function useUsersQuery(params: { page?: number; limit?: number; search?: string } = {}) {
  return useQuery<BasicUser[]>({
    queryKey: ['users-basic', params],
    queryFn: async () => {
      const res = await UsersService.list({ ...params, limit: params.limit ?? 100 });
      return res.data.map((u) => ({ id: u.id, email: u.email, fullName: u.fullName }));
    },
    staleTime: 60 * 1000,
  });
}
