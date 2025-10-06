// app/types/Covenant.ts

export interface Covenant {
    id: number
    institutionId: number
    name: string
    code: string
    category?: string
    status: 'available' | 'assigned' | 'maintenance' | 'lost' | 'disposed'
    location?: string
    condition?: string
    lastMaintenance?: string | null
    nextMaintenance?: string | null
    description?: string | null
    createdAt?: string
    updatedAt?: string
  
    // optional relational fields
    assignments?: CovenantAssignment[]
  }
  
  export interface CovenantAssignment {
    id: number
    covenantId: number
    employeeId: number
    assignedBy?: number
    assignedAt: string
    confirmedAt?: string | null
    returnedAt?: string | null
    notes?: string | null
    status: 'pending' | 'confirmed' | 'returned'
  
    // optional populated info
    employeeName?: string
    covenantName?: string
  }