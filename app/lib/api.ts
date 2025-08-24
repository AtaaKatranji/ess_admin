// lib/api.ts
import axios from "axios";

export const api = axios.create({
  // Leave baseURL empty to keep requests same-origin (recommended),
  // or set to your API origin if you *must* go cross-site. process.env.NEXT_PUBLIC_API_BASE ||
  baseURL:  "https://ess.zero-2-one.org",
  withCredentials: true, // send cookies
  headers: { Accept: "application/json" },
});
export type ApiError = {
  message?: string;
  required?: string[];
} | null;

export type ApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
  res: Response;
};

export type ApiFailure = {
  ok: false;
  status: number;
  data: ApiError;
  res: Response;
};
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
export async function apiGet<T>(url: string): Promise<ApiSuccess<T> | ApiFailure> {
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (res.ok) {
    return { ok: true, status: res.status, data: data as T, res };
  }
  return { ok: false, status: res.status, data: (data as ApiError) ?? null, res };
}

// Optional: add CSRF header automatically if your server requires it
// api.interceptors.request.use((config) => {
//   const token = getCsrfFromCookieOrMeta(); // implement this
//   if (token) config.headers["X-CSRF-Token"] = token;
//   return config;
// });