export interface Employee {
    id: number
    name: string
    position: string
    department: string
  }

export interface  Holiday  {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  institutionId: number;
};

export interface SSIDInfo {
  wifiName: string;
  macAddress: string;
}

export interface Institution {
  id: number;
  adminId: number;
  name: string;
  address: string;
  uniqueKey: string;
  macAddresses: SSIDInfo[]; // see note below
  image: string | null;
  slug: string;
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date if you parse it
}