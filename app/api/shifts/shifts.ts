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