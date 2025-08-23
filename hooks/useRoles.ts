// hooks/useRoles.ts
import useSWR from 'swr';
import  fetcher  from '@/app/lib/fetcher';

import type { Role } from "@/app/types/rbac";

// hooks/useRoles.ts
export function useRoles(opts?: { withCounts?: boolean; institutionId?: number }) {
  const params = new URLSearchParams();
  if (opts?.withCounts) params.set('withCounts', '1');
  if (opts?.institutionId) params.set('institutionId', String(opts.institutionId));
  const qs = params.toString() ? `?${params.toString()}` : '';

  const { data, error, isLoading, mutate } = useSWR<Role[]>(
    `/rbac/roles${qs}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10_000 }
  );

  return { roles: data ?? [], isLoading, isError: !!error, mutateRoles: mutate, error };
}


export function useRolesPermissions() {
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
