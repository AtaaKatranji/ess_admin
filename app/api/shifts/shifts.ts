const BaseUrl = process.env.NEXT_PUBLIC_API_URL;


export const fetchShifts = async (institutionKey: string) => {
  try {
    const response = await fetch(`${BaseUrl}/shift/Ins`, {
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

export const fetchTimeShifts = async (userId: string) => {
  const response = await fetch(`${BaseUrl}/shift/time`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }), // Wrap in an object
  });
  const data = await response.json();

  if (data.success) {
    if (data.shifts.length === 1) {
      // Return start and end time of the single shift
      return {
        startTime: data.shifts[0].startTime,
        endTime: data.shifts[0].endTime,
      };
    } else {
      // Return an array of start and end times for multiple shifts
      return data.shifts.map((shift: { startTime: string; endTime: string; }) => ({
        startTime: shift.startTime,
        endTime: shift.endTime,
      }));
    }
  }
};