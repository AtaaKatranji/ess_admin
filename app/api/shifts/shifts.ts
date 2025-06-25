const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
import { Shift } from '@/app/types/Shift';

export const fetchShifts = async (institutionKey: string) => {
  try {
    const response = await fetch(`${BaseUrl}/shifts/institution?institutionKey=${institutionKey}`, {
      
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify({ institutionKey }), // Wrap in an object
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shifts');
    }

    const data = await response.json();
    console.log("data in fetch api",data);
    return data;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

export const fetchTimeShifts = async (employeeId: string) => {
  console.log("fetchTimeShifts",employeeId)
  const response = await fetch(`${BaseUrl}/shifts/time?employeeId=${employeeId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    //body: JSON.stringify({ employeeId }), // Wrap in an object
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

export const addShift = async (newShift: Shift) => {
  // if (!newShift.name || !newShift.startTime || !newShift.endTime || newShift.days.length === 0) {
  //   toast.error('Please fill all required fields')
  //   return
  // }

  try {
    const shiftResponse = await fetch(`${BaseUrl}/shifts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShift), // No need to set employees here
    })

    if (!shiftResponse.ok) {
      const errorData = await shiftResponse.json()
      throw new Error(errorData.message || 'Failed to add shift')
    }

    const shiftData = await shiftResponse.json()
    console.log('Created shift:', shiftData)

    // Handle breaks
    if (newShift.breakTypes && newShift.breakTypes.length > 0) {
      const breakPromises = newShift.breakTypes.map(breakItem =>
        fetch(`${BaseUrl}/break/break-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...breakItem, shiftId: shiftData.id })
        })
      )
      await Promise.all(breakPromises)
    }

    // setShifts([...shifts, { ...shiftData, employees: [] }])
    return shiftData;
  } catch (error) {
    console.error('Error adding shift:', error)
  }
}
export const updateShift = async (newShift: Shift) => {


    try {
      console.log('Sending update data:', JSON.stringify(newShift)); // Log what’s sent
      const shiftResponse = await fetch(`${BaseUrl}/shifts/${newShift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift),
      })

      if (!shiftResponse.ok) {
        const errorData = await shiftResponse.json()
        throw new Error(errorData.message || 'Failed to update shift')
      }

      const shiftData = await shiftResponse.json()
      console.log('Received updated shift:', shiftData);

      // Ensure days is an array
      const sanitizedShift = {
        ...shiftData,
        days: Array.isArray(shiftData.days) ? shiftData.days : JSON.parse(shiftData.days || '[]'),
        employees: shiftData.employees || [],
    };
      // Handle breaks (similar to addShift)
      if (newShift.breakTypes && newShift.breakTypes.length > 0) {
        const breakPromises = newShift.breakTypes.map(breakItem =>
          breakItem.id && !breakItem.id.startsWith('temp-')
            ? fetch(`${BaseUrl}/break/break-types/${breakItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...breakItem, shiftId: newShift.id })
              })
            : fetch(`${BaseUrl}/break/break-types`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...breakItem, shiftId: newShift.id })
              })
        )
        await Promise.all(breakPromises)
      }


        return sanitizedShift;
    
    } catch (error) {
      console.error('Error updating shift:', error)
      
    }
  }
  // const fetchBreaksForShift = async (shiftId : string) => {
  //   try {
  //     const response = await fetch(`${BaseURL}/break/break-types/shift/${shiftId}`);
    
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch breaks');
  //     }
  //     const data = await response.json();
  //     return data;
  //   } catch (error) {
  //     console.error('Error fetching breaks:', error);
  //     return [];
  //   }
  // };