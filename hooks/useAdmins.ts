// useAdmins.ts
import useSWR from "swr";
import { fetcher  } from "@/lib/fetcher";
import type { AdminLink } from "@/app/types/rbac";

export type Role = { id: string; name: string };



export function useAdmins( institutionId?: number) {
  const key = institutionId ? `https://ess.zero-2-one.org/rbac/admins/${institutionId}` : null;

  const { data, error, isLoading, mutate } = useSWR<AdminLink[]>(key, fetcher, {
    dedupingInterval: 2000,
  });

  return {
    admins: data ?? [],
    isLoading,
    isError: !!error,
    mutateAdmins: mutate,
    error,
    key, // expose the key in case you want global mutate too
  };
}
