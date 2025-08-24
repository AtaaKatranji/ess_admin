// types
export interface WifiEntry {
  
  wifiName: string;
  macAddress: string;

}
export type InstitutionInfo = {
  id: number;
  name: string;
  slug: string;
  adminId: number;
  address: string;
  uniqueKey: string;
  macAddresses: WifiEntry[];
  createdAt: string; // or Date if you parse it
  updatedAt: string;
  image: string | null;
};

type RawInstitution = Omit<InstitutionInfo, "macAddresses"> & {
  macAddresses?: string | WifiEntry[] | null;
};

export function normalizeInstitution(raw: RawInstitution): InstitutionInfo {
  let mac: WifiEntry[] = [];

  if (typeof raw.macAddresses === "string") {
    try {
      mac = JSON.parse(raw.macAddresses) as WifiEntry[];
    } catch {
      // ignore parsing errors
    }
  } else if (Array.isArray(raw.macAddresses)) {
    mac = raw.macAddresses;
  }

  return { ...(raw as Omit<RawInstitution, "macAddresses">), macAddresses: mac };
}

export function normalizeMacAddress(input: string): string | null {
  const cleaned = input.trim().toUpperCase().replace(/[^0-9A-F]/g, '');
  if (cleaned.length !== 12) return null;
  return cleaned.match(/.{1,2}/g)!.join(':');
}

export  function normalizeMacList(v: unknown): WifiEntry[] {
  if (Array.isArray(v)) {
    // لو API رجّع [{wifiName, macAddress}] مباشرة
    return v
      .map(x => {
        const mac = normalizeMacAddress((x).macAddress ?? '');
        const name = String((x).wifiName ?? '').trim();
        return mac && name ? { wifiName: name, macAddress: mac } : null;
      })
      .filter(Boolean) as WifiEntry[];
  }
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return normalizeMacList(parsed);
    } catch {
      return [];
    }
  }
  return [];
}