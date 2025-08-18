// lib/fetcher.ts
import { api } from "./api";
export  const  axiosFetcher = (url: string) =>
  api.get(url).then((r) => r.data);
  