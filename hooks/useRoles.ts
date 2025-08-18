// hooks/useRoles.ts
import useSWR from 'swr';
import  fetcher  from '@/app/lib/fetcher';

import type { Role } from "@/app/types/rbac";

export function useRoles() {
  const { data, error, isLoading, mutate } = useSWR<Role[]>(
    `/rbac/roles`,
    fetcher,
    {
      revalidateOnFocus: false, // roles rarely change; tweak as you like
      dedupingInterval: 10_000,
    }
  );

  return {
    roles: data ?? [],
    isLoading,
    isError: !!error,
    mutateRoles: mutate,
    error,
  };
}
