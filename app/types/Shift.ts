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
    institutionKey: string;
    employees?: Employee[];
    lateLimit: number;
    lateMultiplier: number;
    extraLimit: number;
    extraMultiplier: number;
    breaks?: Break[];
  }

type  Employee = {
    id: string; // Changed from id to id for MySQL
    name: string;
  }
  
type  Break = {
    id: string; // Changed from id to id
    name: string;
    duration: number;
    icon?: string;
    shiftId?: string; // Added to associate with shift
  }
  


