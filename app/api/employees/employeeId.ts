
import moment from "moment";

const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

// interface Employee {
//   id: number;
//   name: string;
//   phoneNumber: string;
//   institutionKey: string;
//   password: string;
//   role: string;
//   gender: string;
//   shiftId: number | null; // null if not assigned
//   institutionId: number;
//   createdAt: string;
//   updatedAt: string;
//   shift?: {
//     name: string;
//   };
//   shiftName?: string;
// }


export const fetchEmployees = async (institutionKey: string) => {
  try {
    const response = await fetch(`${BaseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ institutionKey }), // Wrap in an object
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    const data = await response.json();
    console.log("data in fetch employee list api",data);
    // Assuming each employee has a property like shiftAssigned or shiftId/null
    // const unassignedEmployees = data.filter(
    //   (emp: Employee) => !emp.shiftId // or !emp.shiftAssigned, adjust as per your model
    // );
    return data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const fetchCheckInOutData = async (shiftId : string) => {
  try {
    const response = await fetch(`${BaseUrl}/checks/checkinout?shiftId=${shiftId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching check-in/out data:', error);
    throw error; // Propagate the error for further handling
  }
};
export const fetchTotalHours = async (employeeId : string, date: Date) => {
  const month = date
  const formattedMonth = moment(month).format('YYYY-MM-01');
  try {
    const response = await fetch(`${BaseUrl}/checks/calculate-hours`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: employeeId, date: formattedMonth }),
      credentials: "include",
    })
    console.log(response)
    if (!response.ok) {
      throw new Error("Failed to fetch total hours")
    }

    const data = await response.json()
    console.log(data.totalHours);
    return data.totalHours;
  } catch (error) {
    console.error("Error fetching total hours:", error)
    throw error
  }
  

}
