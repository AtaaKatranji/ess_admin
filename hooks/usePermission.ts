// hooks/usePermissions.ts
import useSWR from "swr";
import fetcher from "@/app/lib/fetcher";
import type { Permission } from "@/app/types/rbac";

export function usePermissions() {
  const { data, error, isLoading, mutate } = useSWR<Permission[]>(
    "/rbac/permissions",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10_000 }
  );

  return {
    permissions: data ?? [],
    isLoading,
    isError: !!error,
    mutatePermissions: mutate,
    error,
  };
}
