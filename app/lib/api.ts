// lib/api.ts
import axios from "axios";

export const api = axios.create({
  // Leave baseURL empty to keep requests same-origin (recommended),
  // or set to your API origin if you *must* go cross-site. process.env.NEXT_PUBLIC_API_BASE ||
  baseURL:  "https://ess.zero-2-one.org",
  withCredentials: true, // send cookies
  headers: { Accept: "application/json" },
});
export async function apiGet<T>(url: string) {
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {}

  return { ok: res.ok, status: res.status, data, res } as {
    ok: boolean;
    status: number;
    data: T | { message?: string; required?: string[] } | null;
    res: Response;
  };
}

// Optional: add CSRF header automatically if your server requires it
// api.interceptors.request.use((config) => {
//   const token = getCsrfFromCookieOrMeta(); // implement this
//   if (token) config.headers["X-CSRF-Token"] = token;
//   return config;
// });