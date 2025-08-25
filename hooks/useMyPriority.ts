// hooks/useMyPriority.ts
import useSWR from 'swr';
import fetcher from "@/app/lib/fetcher";

export function useMyPriority(institutionId?: number | null) {
  const key = institutionId ? `/rbac/my-priority?institutionId=${institutionId}` : null;
  const { data, error, mutate, isLoading } = useSWR(key, fetcher);
  return {
    myPriority: data?.priority ?? 0,
    roleName: data?.roleName ?? null,
    isLoading,
    isError: !!error,
    mutateMyPriority: mutate,
  };
}
