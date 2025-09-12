import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService, userKeys, type UserListParams } from '../services/usersService';

export function useCreateUserMutation(params: UserListParams = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: UsersService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.list(params) });
    },
  });
}

export function useUpdateUserMutation(params: UserListParams = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof UsersService.update>[1] }) =>
      UsersService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: userKeys.list(params) });
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

export function useDeleteUserMutation(params: UserListParams = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UsersService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.list(params) });
    },
  });
}

