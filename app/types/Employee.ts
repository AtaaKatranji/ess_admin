export interface Employee {
    contractType: string
    birthDate: string
    maritalStatus: string
    hireDate: string
    gender: string
    role: string
    resignationNotes: string
    resignationReason: string
    emergencyContactName: string
    emergencyContactRelation: string
    emergencyContactPhone: string
    
    id: number
    name: string
    position: string
    address: string
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

