// lib/fetcher.ts
import { api } from "./api";
  const  fetcher = (url: string) =>
  api.get(url).then((res) => res.data);
  // Minimal helpers for mutations using the same api instance
  export const poster = <T>(url: string, data?: unknown) =>
    api.post<T>(url, data).then(res => res.data);
  export const deleter = <T >(url: string) =>
    api.delete<T>(url).then(res => res.data);

 export default fetcher; 