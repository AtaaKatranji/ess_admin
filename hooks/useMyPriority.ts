// hooks/useMyPriority.ts
import useSWR from 'swr';

const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json());

export function useMyPriority(institutionId?: number | null) {
  const key = institutionId ? `${BaseUrl}/rbac/my-priority?institutionId=${institutionId}` : null;
  const { data, error, mutate, isLoading } = useSWR(key, fetcher);
  return {
    myPriority: data?.priority ?? 0,
    roleName: data?.roleName ?? null,
    isLoading,
    isError: !!error,
    mutateMyPriority: mutate,
  };
}
