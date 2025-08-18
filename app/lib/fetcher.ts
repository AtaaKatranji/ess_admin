// lib/fetcher.ts
export async function authedJSON<T = unknown>(
    input: RequestInfo,
    init: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(input, {
      ...init,                        // allow per-call overrides
      credentials: "include",         // ALWAYS send cookies
      headers: {
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error((await res.text()) || "Request failed");
    return (await res.json()) as T;
  }
  