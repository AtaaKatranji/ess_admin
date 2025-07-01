'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Holiday } from "@/app/types/Employee";
import { useEffect, useState } from "react";

const BaseUrl = process.env.NEXT_PUBLIC_API_URL; 
type ShiftType = {
  mode: 'standard' | 'advanced';
  startTime: string; // e.g., "08:00:00"
  endTime: string;   // e.g., "16:00:00"
  days: string[];    // ['Monday', ...]
  overrides?: Record<string, { start: string; end: string }>; // Advanced
};

type HolidayHoursCardProps = {
  holidays: Holiday[];
  shiftId: string;
};

const HolidayHoursCard: React.FC<HolidayHoursCardProps> = ({ holidays, shiftId }) => {
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [shift, setShift] = useState<ShiftType>();
  useEffect(() => {
    console.log("in holiday hours card");
    fetch(`${BaseUrl}/shifts?id=${shiftId}`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch shift"))
      .then(shift => {
        console.log("shift in holiday hours card", shift);
        setShift(shift);
      })
      .catch(err => console.error("Error fetching shift:", err));
  }, [shiftId]);
  // Helper to get hours between two "HH:mm" times
  function hoursBetween(start: string, end: string) {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH + endM/60) - (startH + startM/60);
  }

  function getDatesBetween(start: string, end: string) {
    const dates = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  // Parse overrides if needed
  const overrides: Record<string, { start: string; end: string }> =
    shift!.mode === "advanced" && typeof shift!.overrides === "string"
      ? JSON.parse(shift!.overrides)
      : (shift!.overrides || {});

  let totalHolidayDays = 0;
  let totalHours = 0;

  for (const holiday of holidays) {
    const dates = getDatesBetween(holiday.startDate, holiday.endDate);
    for (const date of dates) {
      const dayName = dayNamesFull[date.getDay()];
      if (shift!.days.includes(dayName)) {
        totalHolidayDays += 1;
        // Calculate hours for this date
        let hours = 0;
        if (shift!.mode === "advanced" && overrides && overrides[dayName]) {
          hours = hoursBetween(overrides[dayName].start, overrides[dayName].end);
        } else {
          // Fallback to standard times
          hours = hoursBetween(shift!.startTime, shift!.endTime);
        }
        totalHours += hours;
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holiday Work Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
         +{totalHours} <span className="text-base font-medium">hours</span>
        </div>
        <div className="text-sm text-muted-foreground mb-2">
          ({totalHolidayDays} day{totalHolidayDays !== 1 ? "s" : ""}, <span className="font-mono">{shift!.mode}</span> mode)
        </div>
      </CardContent>
    </Card>
  );
};

export default HolidayHoursCard;

