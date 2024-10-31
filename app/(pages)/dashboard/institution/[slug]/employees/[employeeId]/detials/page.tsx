"use client";

import { CalendarXIcon, Clock10, Loader2, LucideStars, Rabbit, Turtle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Input } from '@/components/ui/input';
import { fetchTimeShifts } from '@/app/api/shifts/shifts';

type History = {
  id: string;
  checkDate: string;
  checkInTime: string;
  checkOutTime: string | null;
};

const EmployeeDetails = () => {
  const [history, setHistory] = useState<History[]>([]);
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [lateHours, setLateHours] = useState<number | null>(null);
  const [earlyLeaveHours, setEarlyLeaveHours] = useState<number | null>(null);
  const [earlyArrivalHours, setEarlyArrivalHours] = useState<number | null>(null);
  const [extraAttendanceHours, setExtraAttendanceHours] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startTime,setStartTime] = useState('');
  const [endTime,setEndTime] = useState('');
  // const [selectedRecord, setSelectedRecord] = useState<History | null>(null);
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

  const params = useParams();
  const employeeId = Array.isArray(params.employeeId) ? params.employeeId[0] : params.employeeId as string;

  const form = useForm<History>();

  const fetchMonthlyHistory = async () => {
    try {
      const response = await fetch(`${BaseUrl}/checks/monthlyHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId: employeeId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch monthly history');
      }
  
      const data = await response.json();
  
      const sortedHistory = data.tempA.sort((a: History, b: History) => {
        return new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime();
      });
  
      setHistory(sortedHistory);
    } catch (error) {
      console.error('Error fetching monthly history:', error);
      toast.error("Failed to fetch monthly history. Please try again.");
    }
  };

  const fetchTotalHours = async () => {
    const date = new Date(); // Get the current date
    const month = date.toLocaleString('default', { month: 'long' }); // Get full month name (e.g., "October")
    const year = date.getFullYear(); // Get the current year (e.g., 2024)
    
    try {
      const response = await fetch(`${BaseUrl}/checks/calculate-hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: employeeId, month: month, year: year }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch total hours');
      }

      const data = await response.json();
      
      setTotalHours(data.total.totalHours);
    } catch (error) {
      console.error('Error fetching total hours:', error);
      toast.error("Failed to fetch total hours. Please try again.");
    }
  };

  // const  fetchTotalLates = async () => {
  //   const date = new Date(); // Get the current date
  //   const month = date.toLocaleString('default', { month: 'long' }); // Get full month name (e.g., "October")
  //   const year = date.getFullYear(); // Get the current year (e.g., 2024)
  //   const [startTime,endTime] = await fetchTimeShifts(employeeId);
  //   try {
  //     const response = await fetch(`${BaseUrl}/checks/timeShift`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ userId: employeeId, month: month, year: year,startTime:startTime,endTime:endTime }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch total hours');
  //     }

  //     const data = await response.json();
  //     setTotalLateHours(data.totalLate);
  //     setTotalExtraHours(data.totalExtr);

  //   } catch (error) {
  //     console.error('Error fetching total hours:', error);
  //     toast.error("Failed to fetch total hours. Please try again.");
  //   }
  // }
  const fetchTimeShift = async () => { 
    const result = await fetchTimeShifts(employeeId);
  
    if (Array.isArray(result)) {
      const firstShift = result[0]; // Adjust to the first shift or any specific shift you need
      setStartTime(firstShift.startTime);
      setEndTime(firstShift.endTime);
    } else if (result) {
      setStartTime(result.startTime);
      setEndTime(result.endTime);
    }
  };
  
  useEffect(() => {
    // Only make the API call when startTime and endTime have been updated
    
    const postTimeShiftData = async () => {
      if (startTime && endTime) {
        const date = new Date();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        console.log(startTime)
        console.log(JSON.stringify({
          userId: employeeId,
          month,
          year,
          startTime,
          endTime,
        }),)
        try {
          const response = await fetch(`${BaseUrl}/checks/timeShift`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: employeeId,
              month,
              year,
              startTime,
              endTime,
            }),
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch total hours');
          }
          console.log(response)
          const data = await response.json();
          console.log(data)
          setExtraAttendanceHours(data.extraAttendanceHours);
          setLateHours(data.lateHours);
          setEarlyArrivalHours(data.earlyArrivalHours);
          setEarlyLeaveHours(data.earlyLeaveHours);
        } catch (error) {
          console.error('Error fetching total hours:', error);
          toast.error("Failed to fetch total hours. Please try again.");
        }
      }
    };
  
    postTimeShiftData();
  }, [startTime, endTime]); 
  // const updateHistoryWithFetchedData = async (data: { id: any; checkDate?: string; checkInTime?: string; checkOutTime?: string | null; }) => {
  //   try {
  //     // Fetch the monthly history
  //     const fetchedHistory = await fetchMonthlyHistory();
  
  //     // Update the record in the state
  //     fetchMonthlyHistory();
  //   } catch (error) {
  //     console.error("Error fetching monthly history:", error);
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTotalHours(), fetchMonthlyHistory(), fetchTimeShift()]);
      setIsLoading(false);
    };

    fetchData();
  }, [employeeId]);

  const openEditDialog = (record: History) => {
    // Set the selected record and reset the form with the selected record's values
    // setSelectedRecord(record);
    form.reset(record);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: History) => {
    console.log("data in front: ",data)
    try {
      const response = await fetch(`${BaseUrl}/checks/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      // Update the local history state
      fetchMonthlyHistory();

      toast.success("Upadted")

      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error("Failed to update record. Please try again.",
);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* <div className="p-2 bg-gray-800 shadow-md">
        <h1 className="text-lg font-semibold m-2 text-white">Employee Details</h1>
      </div> */}
      <ToastContainer />
      <div className="p-4 md:p-5 bg-gray-50 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
          <div className="bg-white shadow-md rounded-lg p-4 mb-4 w-full md:w-1/2 lg:w-1/5">
            <h2 className="text-base md:text-lg font-semibold flex items-center justify-between">
              <Clock10 className="h-8 w-8" />
              <div className="flex flex-col justify-end items-start">
                <p>Total Hours This</p>
                <p>Month:</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-green-600 block md:inline mt-1 md:mt-0">{totalHours}</span>
                <span className="text-green-600 block md:inline mt-1 md:mt-0">hours</span>
              </div>
            </h2>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 mb-4 w-full md:w-1/2 lg:w-1/5">
            <h2 className="text-base md:text-lg font-semibold flex items-center justify-between">
              <Clock10 className="h-8 w-8" />
              <div className="flex flex-col justify-end items-start">
                <p>Early Arrive This</p>
                <p>Month:</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-green-600 block md:inline mt-1 md:mt-0">{earlyArrivalHours}</span>
                <span className="text-green-600 block md:inline mt-1 md:mt-0">hours</span>
              </div>
            </h2>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 mb-4 w-full md:w-1/2 lg:w-1/5">
            <h2 className="text-base md:text-lg font-semibold flex items-center justify-between">
              <Turtle className="h-8 w-8" />
              <div className="flex flex-col justify-end items-start">
                <p>Late Hours This</p>
                <p>Month:</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-red-600 block md:inline mt-1 md:mt-0">{lateHours}</span>
                <span className="text-red-600 block md:inline mt-1 md:mt-0">hours</span>
              </div>
            </h2>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 mb-4 w-full md:w-1/2 lg:w-1/5">
            <h2 className="text-base md:text-lg font-semibold flex items-center justify-between">
              <Rabbit className="h-8 w-8" />
              <div className="flex flex-col justify-end items-start">
                <p>Early Leave This</p>
                <p>Month:</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-red-600 block md:inline mt-1 md:mt-0">{earlyLeaveHours}</span>
                <span className="text-red-600 block md:inline mt-1 md:mt-0">hours</span>
              </div>
            </h2>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 mb-4 w-full md:w-1/2 lg:w-1/5">
            <h2 className="text-base md:text-lg font-semibold flex items-center justify-between">
              <LucideStars className="h-8 w-8" />
              <div className="flex flex-col justify-end items-start">
                <p>Extra Hours This</p>
                <p>Month:</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-green-600 block md:inline mt-1 md:mt-0">{extraAttendanceHours}</span>
                <span className="text-green-600 block md:inline mt-1 md:mt-0">hours</span>
              </div>
            </h2>
          </div>
        </div>
      <div className='flex flex-row justify-between '>
        <div className="bg-white w-full shadow-md rounded-lg  m-4">
          <h3 className="bg-gray-800 text-white text-lg font-semibold rounded-t-lg p-2">Attendance Records:</h3>
          <div className="overflow-y-auto p-2 max-h-[26rem]">
            <ul className="space-y-2">
              {history.map((record) => (
                <li
                  key={record.id}
                  className="text-sm md:text-base text-gray-700 p-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
                  onClick={() => openEditDialog(record)}
                >
                  <span className="font-medium">
                    {format(new Date(record.checkDate), 'yyyy-MM-dd')}
                  </span> - Check-in: {record.checkInTime}, Check-out: {record.checkOutTime || 'Not yet checked out'}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white w-full shadow-md rounded-lg  my-4">
            <h3 className="bg-gray-800 text-white text-lg font-semibold rounded-t-lg p-2">Leave Requests:</h3>
            <div className="overflow-y-auto max-h-[26rem]">
              {/* Implement leave requests mapping here if needed */}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Check-in Record</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="checkDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? format(new Date(field.value ), "P") : <span>Pick a date</span>}
                            <CalendarXIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const localISOTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, -1); // Remove 'Z' at the end
                              field.onChange(localISOTime);
                            }
                          }}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* check In */}
              <FormField
                control={form.control}
                name="checkInTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-in Time</FormLabel>
                    <FormControl>
                      {
                        field.value === null ? (
                          <div className='flex flex-col my-2'>
                            
                            <input
                              type="time"
                              {...field}
                              className="p-2 border rounded"
                              value={field.value || ''} // Display the value if it exists, or empty string if null
                              onChange={(e) => {
                                const newValue = e.target.value || null;
                                field.onChange(newValue); // Update the form field value
                              }}
                            />
                            <span className="text-red-500">Need value</span>
                          </div>
                        ) : (
                          <Input
                            type="time"
                            {...field}
                            className="p-2 border rounded"
                            value={field.value} // Ensure the value is displayed
                            onChange={field.onChange} // Ensure changes are handled
                          />
                        )
                      }
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Check Out */}
              <FormField
                control={form.control}
                name="checkOutTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-out Time</FormLabel>
                    <FormControl>
                      {
                        field.value === null ? (
                          <div className='flex flex-col my-2'>
                            
                            <input
                              type="time"
                              {...field}
                              className="p-2 border rounded"
                              value={field.value || ''} // Display the value if it exists, or empty string if null
                              onChange={(e) => {
                                const newValue = e.target.value || null;
                                field.onChange(newValue); // Update the form field value
                              }}
                            />
                            <span className="text-red-500">Need value</span>
                          </div>
                        ) : (
                          <Input
                            type="time"
                            {...field}
                            className="p-2 border rounded"
                            value={field.value} // Ensure the value is displayed
                            onChange={field.onChange} // Ensure changes are handled
                          />
                        )
                      }
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDetails;
