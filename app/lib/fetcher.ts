// lib/fetcher.ts
import { api } from "./api";
  const  fetcher = (url: string) =>
  api.get(url).then((r) => r.data);
 export default fetcher; 