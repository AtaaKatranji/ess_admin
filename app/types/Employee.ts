export interface Employee {
    id: number
    name: string
    position: string
    department: string
    email?: string
    status: string
    shiftId?: string
    shiftName?: string

  }

export interface  Holiday  {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  institutionId: number;
};

