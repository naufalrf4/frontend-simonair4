import { useQuery } from '@tanstack/react-query';
import { UsersService, userKeys, type UserListParams, type UserListResponse } from '../services/usersService';

export function useUsersListQuery(params: UserListParams = {}) {
  return useQuery<UserListResponse>({
    queryKey: userKeys.list(params),
    queryFn: () => UsersService.list(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) return false;
      return failureCount < 3;
    },
  });
}

