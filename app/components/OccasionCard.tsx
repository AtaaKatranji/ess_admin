'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Holiday } from "@/app/types/Employee";
  
  type HolidayHoursCardProps = {
    holidays: Holiday[];
    workDays: string[];
    shiftStart?: string; // e.g. "09:00"
    shiftEnd?: string;   // e.g. "17:00"
  };
  
  const HolidayHoursCard: React.FC<HolidayHoursCardProps> = ({
    holidays,
    workDays,
    shiftStart, // e.g. "09:00"
    shiftEnd,
  }) => {
    const hoursPerShift =  parseInt(shiftEnd!.split(":")[0]) - parseInt(shiftStart!.split(":")[0]);
    console.log("hoursPerShift", hoursPerShift);
    const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// If you have short names, use this:
// const workDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Sat'];
// const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
    let totalHolidayDays = 0;

    for (const holiday of holidays) {
        const dates = getDatesBetween(holiday.startDate, holiday.endDate);
        for (const date of dates) {
            const dayName = dayNamesFull[date.getDay()]; // Use dayNamesShort if workDays uses short names
            if (workDays.includes(dayName)) {
                totalHolidayDays += 1;
            }
        }
    }
    
    console.log("Total holiday days (matching workdays):", totalHolidayDays);
    const totalHours = totalHolidayDays * hoursPerShift;
  
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
          ({totalHolidayDays} day{totalHolidayDays !== 1 ? "s" : ""} × {hoursPerShift} hours per day)
        </div>
        {/* <ul className="text-xs text-muted-foreground space-y-1">
          {mockHolidayDays.map((h) => (
            <li key={h.date}>
              {h.date}: <span className="font-semibold">{h.name}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 text-xs text-muted-foreground">
          Shift hours: <b>{shiftStart}</b> to <b>{shiftEnd}</b>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default HolidayHoursCard;
