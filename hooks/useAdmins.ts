// useAdmins.ts
import useSWR from "swr";
import fetcher from "@/app/lib/fetcher";
import type { AdminLink } from "@/app/types/rbac";

export type Role = { id: string; name: string };



export function useAdmins( institutionId?: number) {
  const key = institutionId ? `/rbac/admins/${institutionId}` : null;

  const { data, error, isLoading, mutate } = useSWR<AdminLink[]>(key, fetcher, {
    dedupingInterval: 10000,
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
