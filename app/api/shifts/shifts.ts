const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
import { Shift } from '@/app/types/Shift';

type HttpError = Error & { status?: number };

export const fetchShifts = async (institutionKey: string) => {
  try {
    const response = await fetch(`${BaseUrl}/shifts/institution?institutionKey=${institutionKey}`, {
      
      method: 'GET',
      credentials: "include",
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
    credentials: "include",
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
        mode: data.shifts[0].mode,
        overrides: data.shifts[0].overrides,
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
      credentials: "include",
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
// function isBreakEdited(original, edited) {
//   if (!original) return false; // Should not happen unless logic bug
//   return (
//     original.name !== edited.name ||
//     original.duration !== edited.duration ||
//     original.icon !== edited.icon ||
//     original.maxUsagePerDay !== edited.maxUsagePerDay
//     // ...add any fields you want to track
//   );
// }
export const updateShift = async (newShift: Shift) => {


    try {
      console.log('Sending update data:', JSON.stringify(newShift)); // Log what’s sent

      // Handle breaks (similar to addShift)
      if (newShift.breakTypes && newShift.breakTypes.length > 0) {
        const breaksToSave = newShift.breakTypes.filter(b =>
          (typeof b.id === 'string' && b.id.startsWith('temp-')) || b.isDirty
        );
      
        const breakPromises = breaksToSave.map(breakItem => {
          // Remove isDirty from breakItem
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { isDirty, ...breakPayload } = breakItem;
        
          return (typeof breakItem.id === 'string' && breakItem.id.startsWith('temp-'))
            ? fetch(`${BaseUrl}/break/break-types`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({ ...breakPayload, shiftId: newShift.id })
              })
            : fetch(`${BaseUrl}/break/break-types/${breakItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({ ...breakPayload, shiftId: newShift.id })
              });
        });
        await Promise.all(breakPromises);
      }
      const shiftResponse = await fetch(`${BaseUrl}/shifts/${newShift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
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
   // Function to delete a break from the backend
export  const deleteBreak = async (breakId: string) => {
    try {
      const response = await fetch(`${BaseUrl}/break/break-types/${breakId}`, {
        method: 'DELETE',
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to delete break');
      }

      // Return true if the break was successfully deleted
      return true;
    } catch (error) {
      console.error('Error deleting break:', error);
      
      return false;
    }
  };

export const fetchShiftReport = async (shiftId: string, month: string, institutionKey: string) => {
  try {
    const response = await fetch(`${BaseUrl}/shifts/summary`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({shiftId, month, institutionKey}), // Wrap in an object
    });

    if (!response.ok) {
      // جرّب تقرأ رسالة السيرفر إن وُجدت
      let serverMsg = "";
      try {
        const body = await response.json();
        serverMsg = body?.error || body?.message || "";
      } catch {
        /* لا شيء */
      }

      let message = serverMsg || "Failed to fetch shift report";
      if (response.status === 403) {
        message = "لا تملك صلاحية لعرض هذا التقرير.";
      } else if (response.status === 401) {
        message = "انتهت الجلسة، يرجى تسجيل الدخول من جديد.";
      }

      const err: HttpError = new Error(message);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    console.log("data of shift report",data);
    return data;
  } catch (error) {
    console.error('Error fetching shift report:', error);
    throw error;
  }
};