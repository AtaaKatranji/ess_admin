'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// MOCK DATA (replace with props or real data)
const mockHolidayDays = [
  { date: "2025-06-05", name: "Day of Arafat" },
  { date: "2025-06-09", name: "Eid al-Adha" },
  { date: "2025-06-10", name: "Eid al-Adha" },
];
const shiftStart = "09:00";
const shiftEnd = "17:00";
const hoursPerShift = 8; // Just as example

const HolidayHoursCard: React.FC = () => {
  const totalHolidayDays = mockHolidayDays.length;
  const totalHours = totalHolidayDays * hoursPerShift;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holiday Work Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {totalHours} <span className="text-base font-medium">hours</span>
        </div>
        <div className="text-sm text-muted-foreground mb-2">
          ({totalHolidayDays} day{totalHolidayDays !== 1 ? "s" : ""} × {hoursPerShift} hours per day)
        </div>
        <ul className="text-xs text-muted-foreground space-y-1">
          {mockHolidayDays.map((h) => (
            <li key={h.date}>
              {h.date}: <span className="font-semibold">{h.name}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 text-xs text-muted-foreground">
          Shift hours: <b>{shiftStart}</b> to <b>{shiftEnd}</b>
        </div>
      </CardContent>
    </Card>
  );
};

export default HolidayHoursCard;
