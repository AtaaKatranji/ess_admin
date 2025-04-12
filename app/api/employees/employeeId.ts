
const BaseUrl = process.env.NEXT_PUBLIC_API_URL;



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

  try {
    const response = await fetch(`${BaseUrl}/checks/calculate-hours`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: employeeId, month }),
      credentials: "include",
    })
    console.log(response)
    if (!response.ok) {
      throw new Error("Failed to fetch total hours")
    }

    const data = await response.json()
    console.log(data.total.totalHours);
    return data.total.totalHours;
  } catch (error) {
    console.error("Error fetching total hours:", error)
    throw error
  }
  

}
