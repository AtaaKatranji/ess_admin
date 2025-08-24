// types
interface SSIDInfo {
  
  wifiName: string;
  macAddress: string;

}
export type InstitutionInfo = {
  id: number;
  name: string;
  slug: string;
  adminId: string;
  address: string;
  uniqueKey: string;
  macAddresses: SSIDInfo[];
};

export type Institution = Omit<InstitutionInfo, 'macAddresses'> & {
  macAddresses?: string[];
};

export function normalizeInstitution(raw: InstitutionInfo): Institution {
  if (typeof raw.macAddresses === 'string') {
    try {
      const parsed = JSON.parse(raw.macAddresses);
      return { ...raw, macAddresses: Array.isArray(parsed) ? parsed.map(String) : undefined };
    } catch {
      return { ...raw, macAddresses: undefined };
    }
  }
  if (Array.isArray(raw.macAddresses)) {
    return { ...raw, macAddresses: raw.macAddresses.map(String) };
  }
  return { ...raw, macAddresses: undefined };
}
