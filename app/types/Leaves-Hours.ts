export type LeaveRequest = {
  id: string;
  user: {
    id: string
    name: string
  }
  status: "Pending" | "Approved" | "Rejected";
  startDate: string;
  endDate: string;
  type: "Paid" | "Unpaid";
  annualPaidLeave: number;
  reason: string;
}

// Hourly leave (custom break) type definition
export type HourlyLeave = {
  breakDetails: {
    id: string;
    employeeId: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: "Approved" | "Rejected" | "Pending"
  };
  employeeDetails: {
    _id: string;
    name: string;
  };
}
