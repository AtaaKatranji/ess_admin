// components/LeaveCard.tsx
'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Edit2 } from 'lucide-react';
import LeaveUpdateDialog from './AnnualLeaveUpdateDialog';
import { useEffect, useState } from 'react';
import { isArray } from "util";

interface LeaveUpdate {
  days: number;
  reason: string;
  timestamp: string;
}

interface LeaveCardProps {
    employeeId: string; // Add employeeId as a prop
  }
export default function LeaveCard({ employeeId }: LeaveCardProps) {
  const [annualPaidLeaves, setAnnualPaidLeaves] = useState<number>(1000);
  
  const [history, setHistory] = useState<LeaveUpdate[]>([]);
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;


  // Update annual paid leaves on the server
  const updateAnnualPaidLeaves = async (update: LeaveUpdate) => {
    console.log("update annual leaves", update);
    try {
      const response = await fetch(`${BaseUrl}/api/annual-leave/update`, {
        method: "PUT", // Using PUT for updates, adjust based on your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: employeeId,
          annualLeave: update.days,
          reason: update.reason,
          timestamp: update.timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update annual leave');
      }

      const data = await response.json();
      return data; // Optionally return updated data if your API provides it
    } catch (error) {
      console.error('Error updating annual leave:', error);
      throw error; // Re-throw to handle in the caller
    }
  };
  // Handle leave update (local and server)
  const handleLeaveUpdate = async (update: LeaveUpdate) => {
    try {
      // Update server first
      await updateAnnualPaidLeaves(update);

      // If successful, update local state
      setAnnualPaidLeaves(update.days);
      setHistory((prev) => [update, ...prev]);
      console.log(`Successfully updated leave for employee ${employeeId}`);
    } catch (error) {
      // Optionally revert local state or show error to user
      console.error('Failed to update leave:', error);
      // You might want to add error handling UI here (e.g., toast notification)
    }
  };
  
  const fetchAnnualPaidLeaves = async (employeeId: string) => {
    try {
        // Make an API call to fetch monthly attendance summary
        const response = await fetch(`${BaseUrl}/api/annual-leave`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: employeeId}),
          credentials: "include",
        });
        
        // Check if the response is okay
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
  
        console.log("data4", response);
        const data = await response.json();
        console.log("data5", data);
        // Map over the monthly attendance data
        if(!isArray(data.annualLeave)){
        // Set the state with the fetched summary
        setAnnualPaidLeaves(data[ "annualLeave"]); 
    }else{
        console.log("data6", data.annualLeave[0].value);
        setAnnualPaidLeaves(data.annualLeave[0].value);
        // Assuming data.annualLeave is an array
const transformedLeaves: LeaveUpdate[] = data.annualLeave.map((item: { value: number; reason: string; timestamp: string | number | Date; }) => ({
    days: item.value, // Map 'value' from the response to 'days'
    reason: item.reason,
    timestamp: new Date(item.timestamp).toISOString() // Convert to ISO string if needed
    }));
    
    // Now update your state
    setHistory(transformedLeaves);
    }

        
    } catch (error) {
        console.error('Error fetching monthly summary:', error);
    }
  };
  
   useEffect(() => {
    fetchAnnualPaidLeaves(employeeId);
    }
    ,[employeeId]);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        {/* Add header content if needed */}
      </CardHeader>
      <CardContent className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-10">
          <h2 className="text-lg font-bold">Annual Paid Leave</h2>
          <p className="text-lg font-bold">{annualPaidLeaves}</p>
          <p className="text-xs text-muted-foreground">Days</p>
        </div>
        <div>
          <LeaveUpdateDialog
            initialDays={1}
            onUpdate={handleLeaveUpdate}
            editHistory={history}
            trigger={
              <button className="p-1 hover:bg-gray-100 rounded">
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}