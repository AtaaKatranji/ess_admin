// lib/fetcher.ts
export const fetcher = (input: RequestInfo, init?: RequestInit) =>
    fetch(input, { credentials: 'include', ...init }).then(async (r) => {
      if (!r.ok) throw new Error((await r.text()) || 'Request failed');
      return r.json();
    });
  