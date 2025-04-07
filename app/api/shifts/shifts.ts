const BaseUrl = process.env.NEXT_PUBLIC_API_URL;


export const fetchShifts = async (institutionKey: string) => {
  try {
    const response = await fetch(`${BaseUrl}/shifts/institution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ institutionKey }), // Wrap in an object
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shifts');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

export const fetchTimeShifts = async (employeeId: string) => {
  console.log("fetchTimeShifts",employeeId)
  const response = await fetch(`${BaseUrl}/shifts/time`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ employeeId }), // Wrap in an object
  });
  const data = await response.json();
  console.log(data)
  if (data.success) {
    if (data.shifts.length === 1) {
      // Return start and end time of the single shift
      console.log(data.shifts[0].startTime,data.shifts[0].endTime,data.shifts[0].days)
      return {
        startTime: data.shifts[0].startTime,
        endTime: data.shifts[0].endTime,
        days: data.shifts[0].days
      };
    } else {
      // Return an array of start and end times for multiple shifts
      console.log(5)
      return data.shifts.map((shift: { startTime: string; endTime: string; days: string[]; }) => ({
        
        startTime: shift.startTime,
        endTime: shift.endTime,
        days: shift.days,
      }));
    }
  }
};