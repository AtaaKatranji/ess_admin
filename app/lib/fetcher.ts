// lib/fetcher.ts
export const authedJSON = async <T = unknown>(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<T> => {
    const res = await fetch(input, {
      credentials: "include",                // <— sends your cookie/token
      headers: {
        Accept: "application/json",
        ...(init?.headers || {}),
      },
      ...init,
    });
    if (!res.ok) throw new Error((await res.text()) || "Request failed");
    return res.json();
  };
  