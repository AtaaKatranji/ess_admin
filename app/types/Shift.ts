export interface Shift {
    id?: string; // Changed from id to id
    name: string;
    mode: string;
    startTime: string;
    endTime: string;
    days: string[];
    overrides?: {
        [day: string]: {
          start: string;
          end: string;
        };
      };
    institutionId: number;
    employees?: Employee[];
    lateLimit: number;
    lateMultiplier: number;
    extraLimit: number;
    extraMultiplier: number;
    breakTypes?: Break[];
  }

type  Employee = {
    id: string; // Changed from id to id for MySQL
    name: string;
    shiftId?: string;
  }
  
export type  Break = {
    id: string; // Changed from id to id
    name: string;
    duration: number;
    icon?: string;
    shiftId?: string; // Added to associate with shift
    maxUsagePerDay: number;
    isDirty: boolean;
  }
 
  interface EmployeeShift {
    id: string,
    name: string;
    role: string;
    daysScheduled: number;
    daysAttended: number;
    daysAbsent: number;
    overTimeHours: number
    holidays: number;
    totalHours: string;
    lateHours: string;
    earlyLeaveHours: string;
    leaves: number;
  }
  interface SummaryMetric {
    label: string;
    value: number | string;
  }
export  type ShiftTimes = { [day: string]: { start: string; end: string } };
export  interface ShiftReportType {
    monthName: string;
    shiftName: string;
    shiftType: string;
    shiftTimes: ShiftTimes;
    scheduleDescription: string;
    summaryMetrics: SummaryMetric[];
    employees: EmployeeShift[];
  }

