// app/providers.tsx (or _app.tsx)
import { SWRConfig } from "swr";
import { authedJSON } from "../lib/fetcher";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource: RequestInfo, init?: RequestInit) =>
          authedJSON(resource, init),
      }}
    >
      {children}
    </SWRConfig>
  );
}
