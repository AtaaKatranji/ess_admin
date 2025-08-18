// lib/api.ts
import axios from "axios";

export const api = axios.create({
  // Leave baseURL empty to keep requests same-origin (recommended),
  // or set to your API origin if you *must* go cross-site.
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "",
  withCredentials: true, // send cookies
  headers: { Accept: "application/json" },
});

// Optional: add CSRF header automatically if your server requires it
// api.interceptors.request.use((config) => {
//   const token = getCsrfFromCookieOrMeta(); // implement this
//   if (token) config.headers["X-CSRF-Token"] = token;
//   return config;
// });