'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Holiday } from "@/app/types/Employee";

type ShiftType = {
  mode: 'standard' | 'advanced';
  startTime: string; // e.g., "08:00:00"
  endTime: string;   // e.g., "16:00:00"
  days: string[];    // ['Monday', ...]
  overrides?: Record<string, { start: string; end: string }>; // Advanced
};

type HolidayHoursCardProps = {
  holidays: Holiday[];
  shiftType: ShiftType;
};

const HolidayHoursCard: React.FC<HolidayHoursCardProps> = ({ holidays, shiftType }) => {
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  console.log("shiftType in holiday hours card", shiftType);
  console.log("holidays in holiday hours card", holidays);
  // Helper to get hours between two "HH:mm" times
  function hoursBetween(start: string, end: string) {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH + endM / 60) - (startH + startM / 60);
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
    shiftType!.mode === "advanced" && typeof shiftType!.overrides === "string"
      ? JSON.parse(shiftType!.overrides)
      : (shiftType!.overrides || {});

  let totalHolidayDays = 0;
  let totalHours = 0;

  for (const holiday of holidays) {
    const dates = getDatesBetween(holiday.startDate, holiday.endDate);
    for (const date of dates) {
      const dayName = dayNamesFull[date.getDay()];
      if (shiftType!.days.includes(dayName)) {
        totalHolidayDays += 1;
        // Calculate hours for this date
        let hours = 0;
        if (shiftType!.mode === "advanced" && overrides && overrides[dayName]) {
          hours = hoursBetween(overrides[dayName].start, overrides[dayName].end);
        } else {
          // Fallback to standard times
          hours = hoursBetween(shiftType!.startTime, shiftType!.endTime);
        }
        totalHours += hours;
      }
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Holiday Work Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          +{totalHours} <span className="text-base font-medium">hours</span>
        </div>
        <div className="text-sm text-muted-foreground mb-2">
          ({totalHolidayDays} day{totalHolidayDays !== 1 ? "s" : ""}, <span className="font-mono">{shiftType!.mode}</span> mode)
        </div>
      </CardContent>
    </Card>
  );
};

export default HolidayHoursCard;

