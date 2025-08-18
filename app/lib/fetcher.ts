// lib/fetcher.ts
import { api } from "./api";
  const  fetcher = (url: string) =>
  api.get(url).then((res) => res.data);
 export default fetcher; 