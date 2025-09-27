export interface Employee {
    id: number
    name: string
    position: string
    department: string
    phoneNumber?: string
    email?: string
    status: string
    shiftId?: string
    shiftName?: string
    avatar?: string
    resignationDate?: string
  }

export interface  Holiday  {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  institutionId: number;
};

