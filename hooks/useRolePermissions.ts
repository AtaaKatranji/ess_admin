// hooks/useRolePermissions.ts
import useSWR from 'swr';
import fetcher from '@/app/lib/fetcher';

// roleId -> permissionKeys[]
export type RolePermissionsMap = Record<number, string[]>;

export function useRolePermissions() {
  const { data, error, isLoading, mutate } = useSWR<RolePermissionsMap>(
    '/rbac/roles/permissions-map',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10_000 }
  );

  return {
    rolePermsMap: data ?? {},
    isLoading,
    isError: !!error,
    mutateRolePerms: mutate,
    error,
  };
}
