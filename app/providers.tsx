// app/providers.tsx (or _app.tsx)
'use client';
import { SWRConfig } from "swr";
import   fetcher   from "@/app/lib/fetcher";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig 
        value={{
            fetcher, 
            refreshInterval: 3000, 
            revalidateIfStale: false, 
            revalidateOnFocus: false
        }}
    >
      {children}
    </SWRConfig>
  );
}
